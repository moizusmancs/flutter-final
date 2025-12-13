import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { User } from "../../types/user.js";
import CustomError from "../../utils/customError.js";
import bcrypt from "bcrypt";
import { ResultSetHeader } from "mysql2";
import { generateToken } from "../../utils/generateToken.js";


export const handleSignupUser = AsyncCall(async (req, res, next) => {

    const {fullname, email, password, phone} = req.body;

    const userAlreadyExists: User[] = await queryDb("select * from users where email = ?", [email]);
    
    if(userAlreadyExists.length > 0){
        return next(new CustomError("an account with this email already exists.", 400))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = "INSERT INTO users (fullname, email, password_hash, phone) VALUES (?, ?, ?, ?)";
    const result = await queryDb<ResultSetHeader>(insertQuery, [fullname, email, hashedPassword, phone]);

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to create user, some issue with db", 500));
    }
    
    const token = generateToken(result.insertId);

    res.status(201).json({
        success: true,
        message: "User created successfully",
        token: token,
        user: {
            id: result.insertId,
            fullname,
            email,
            phone
        }
    })

});

export const handleLoginUser = AsyncCall(async (req, res, next) => {

    const {email, password} = req.body;

    const userExists = await queryDb<User[]>("select * from users where email = ?", [email]);

    if(!userExists[0]){
        return next(new CustomError("invalid email address. no account exists.", 404));
    }

    const isPasswordValid = await bcrypt.compare(password, userExists[0].password_hash);

    if(!isPasswordValid){
        return next(new CustomError("invalid password, please try again.", 400));
    }

    const token = generateToken(userExists[0].id);

    const user = userExists[0];
    delete user.password_hash;

    res.status(200).json({
        success: true,
        message: "User logged-in successfully",
        token: token,
        user
    })
});

export const handleLogoutUser = AsyncCall(async (req, res, next) => {
    // Token-based auth: logout handled on client side by clearing local storage
    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
});