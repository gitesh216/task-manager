import { body } from "express-validator";

const userRegistrationValidator = () => {
    console.log(body);
    
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
        ,
        body('username')
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({min: 2}).withMessage("Username length should be atleast 3 characters")
            .isLength({max: 13}).withMessage("Username cannot exceed 13 characters")
        ,
        body('password')
            .trim()
            .notEmpty().withMessage("Password is required")
            .isLength({min: 2}).withMessage("Password length should be atleast 3 characters")
            .isLength({max: 13}).withMessage("Password cannot exceed 13 characters")
        ,
        body('fullname')
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({min: 2}).withMessage("Username length should be atleast 3 characters")
            .isLength({max: 13}).withMessage("Username cannot exceed 13 characters")
    ];
};

const userLoginValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email")
        ,
        body('password')
            .trim()
            .notEmpty().withMessage("Password cannot be empty")
    ];
};

export { userRegistrationValidator, userLoginValidator }