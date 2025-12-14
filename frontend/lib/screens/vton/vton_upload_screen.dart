import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/providers/auth_provider.dart';
import 'package:frontend/data/repositories/vton_repository.dart';
import 'package:frontend/data/models/vton_model.dart';
import 'package:frontend/screens/vton/vton_result_screen.dart';

class VtonUploadScreen extends StatefulWidget {
  final int productId;

  const VtonUploadScreen({super.key, required this.productId});

  @override
  State<VtonUploadScreen> createState() => _VtonUploadScreenState();
}

class _VtonUploadScreenState extends State<VtonUploadScreen> {
  final ImagePicker _picker = ImagePicker();
  late VtonRepository _vtonRepository;
  File? _selectedImage;
  bool _isUploading = false;
  bool _isGenerating = false;
  List<UserImage> _userImages = [];
  List<VtonGeneration> _vtonHistory = [];
  bool _isLoadingImages = false;
  UserImage? _selectedExistingImage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      _vtonRepository = VtonRepository(authProvider.dioClient);
      _loadUserImages();
      _loadVtonHistory();
    });
  }

  Future<void> _loadUserImages() async {
    setState(() {
      _isLoadingImages = true;
    });

    try {
      final result = await _vtonRepository.getUserImages();

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            _userImages = result.data!;
            _isLoadingImages = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoadingImages = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingImages = false;
        });
      }
    }
  }

  Future<void> _loadVtonHistory() async {
    try {
      final result = await _vtonRepository.getVtonHistory();

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            _vtonHistory = result.data!
                .where((vton) => vton.status == 'completed')
                .toList();
          });
        }
      }
    } catch (e) {
      // Silently fail, history is optional
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1200,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _selectedExistingImage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Error picking image';

        // Check if it's a camera error on simulator
        if (source == ImageSource.camera && e.toString().contains('camera')) {
          errorMessage = 'Camera not available in simulator. Please use a real device or select from gallery.';
        } else if (e.toString().contains('photo_access_denied') ||
                   e.toString().contains('Limited Library Picker')) {
          errorMessage = 'Please allow photo library access in Settings.';
        } else if (e.toString().contains('no_available_camera')) {
          errorMessage = 'No camera available on this device.';
        } else if (source == ImageSource.gallery) {
          errorMessage = 'Could not access photo library. Make sure you have photos in the simulator (drag & drop images onto the simulator).';
        } else {
          errorMessage = 'Error picking image. Try using gallery instead.';
        }

        print('Image picker error: $e'); // Debug log

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _uploadAndGenerate() async {
    if (_selectedImage == null && _selectedExistingImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select or upload an image'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    int? userImageId;

    // If using a new image, upload it first
    if (_selectedImage != null) {
      setState(() {
        _isUploading = true;
      });

      try {
        // Step 1: Get upload URL
        print('Step 1: Getting upload URL...');
        final fileName = 'user_image_${DateTime.now().millisecondsSinceEpoch}';
        final urlResult = await _vtonRepository.getUploadUrl(fileName);

        if (!urlResult.success || urlResult.data == null) {
          print('Failed to get upload URL: ${urlResult.error}');
          throw Exception(urlResult.error ?? 'Failed to get upload URL');
        }

        final uploadUrls = urlResult.data!;
        print('Upload URL received: ${uploadUrls.uploadUrl.substring(0, 50)}...');

        // Step 2: Upload to S3
        print('Step 2: Uploading to S3...');
        final uploadResult = await _vtonRepository.uploadImageToS3(
          uploadUrls.uploadUrl,
          _selectedImage!,
        );

        if (!uploadResult.success) {
          print('Failed to upload to S3: ${uploadResult.error}');
          throw Exception(uploadResult.error ?? 'Failed to upload image');
        }
        print('S3 upload successful');

        // Step 3: Save user image metadata
        print('Step 3: Saving image metadata...');
        final saveResult = await _vtonRepository.saveUserImage(
          uploadUrls.fileUrl,
          uploadUrls.s3Key,
        );

        if (!saveResult.success || saveResult.data == null) {
          print('Failed to save metadata: ${saveResult.error}');
          throw Exception(saveResult.error ?? 'Failed to save image metadata');
        }

        userImageId = saveResult.data!['id'] as int;
        print('Image saved with ID: $userImageId');

        if (mounted) {
          setState(() {
            _isUploading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isUploading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Upload failed: ${e.toString()}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }
    } else if (_selectedExistingImage != null) {
      userImageId = _selectedExistingImage!.id;
    }

    // Generate VTON
    if (userImageId != null) {
      await _generateVton(userImageId);
    }
  }

  Future<void> _generateVton(int userImageId) async {
    setState(() {
      _isGenerating = true;
    });

    try {
      final result = await _vtonRepository.generateVton(
        userImageId: userImageId,
        productId: widget.productId,
        segmentationType: 0, // 0=upper body
      );

      if (result.success && result.data != null) {
        final vtonResponse = result.data!;

        if (mounted) {
          setState(() {
            _isGenerating = false;
          });

          // Navigate to result screen
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => VtonResultScreen(
                vtonId: vtonResponse.vtonId,
                productId: widget.productId,
              ),
            ),
          );
        }
      } else {
        throw Exception(result.error ?? 'Failed to generate VTON');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGenerating = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Generation failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isProcessing = _isUploading || _isGenerating;

    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: const Text('Virtual Try-On'),
        centerTitle: true,
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Instructions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.info.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.info, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'For best results, use a clear photo showing your upper body',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Simulator warning (if on simulator, camera won't work)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.orange.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.phone_iphone, color: Colors.orange, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Using Simulator?',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.only(left: 32),
                    child: Text(
                      '• Camera won\'t work - test on real device\n• To use Gallery: Drag & drop an image onto the simulator window first',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Selected/Preview Image
            if (_selectedImage != null || _selectedExistingImage != null) ...[
              Text(
                'Selected Image',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: double.infinity,
                  height: 300,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 2),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: _selectedImage != null
                      ? Image.file(_selectedImage!, fit: BoxFit.cover)
                      : Image.network(
                          _selectedExistingImage!.imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Icon(Icons.error, color: AppColors.error),
                        ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: isProcessing
                          ? null
                          : () {
                              setState(() {
                                _selectedImage = null;
                                _selectedExistingImage = null;
                              });
                            },
                      icon: const Icon(Icons.close),
                      label: const Text('Remove'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.error,
                        side: BorderSide(color: AppColors.error),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],

            // Upload Options
            Text(
              'Upload New Photo',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildUploadOption(
                    icon: Icons.photo_camera,
                    label: 'Camera',
                    onTap: isProcessing
                        ? null
                        : () => _pickImage(ImageSource.camera),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildUploadOption(
                    icon: Icons.photo_library,
                    label: 'Gallery',
                    onTap: isProcessing
                        ? null
                        : () => _pickImage(ImageSource.gallery),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Previously uploaded images
            if (_userImages.isNotEmpty) ...[
              Text(
                'Or Choose from Previous Photos',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 120,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _userImages.length,
                  itemBuilder: (context, index) {
                    final userImage = _userImages[index];
                    final isSelected = _selectedExistingImage?.id == userImage.id;

                    return GestureDetector(
                      onTap: isProcessing
                          ? null
                          : () {
                              setState(() {
                                _selectedExistingImage = userImage;
                                _selectedImage = null;
                              });
                            },
                      child: Container(
                        width: 100,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.buttonPrimary
                                : AppColors.border,
                            width: isSelected ? 3 : 1,
                          ),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Image.network(
                          userImage.imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Icon(Icons.error, color: AppColors.error),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Previous Try-Ons section
            if (_vtonHistory.isNotEmpty) ...[
              Text(
                'Previous Try-Ons',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 160,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _vtonHistory.length,
                  itemBuilder: (context, index) {
                    final vton = _vtonHistory[index];

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VtonResultScreen(
                              vtonId: vton.id,
                              productId: widget.productId,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        width: 120,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border, width: 1),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(
                              vton.generatedImageUrl ?? '',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Icon(Icons.error, color: AppColors.error),
                            ),
                            // Overlay with view icon
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withValues(alpha: 0.7),
                                    ],
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.visibility,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'View',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Generate button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isProcessing ? null : _uploadAndGenerate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.buttonPrimary,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  elevation: 2,
                ),
                child: isProcessing
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: AppColors.white,
                              strokeWidth: 2,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            _isUploading ? 'Uploading...' : 'Generating...',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.auto_awesome),
                          SizedBox(width: 8),
                          Text(
                            'Generate Virtual Try-On',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 16),

            // Loading indicator
            if (_isLoadingImages)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(
                    color: AppColors.buttonPrimary,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadOption({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.buttonPrimary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 32,
                color: AppColors.buttonPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
