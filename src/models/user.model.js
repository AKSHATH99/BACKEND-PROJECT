
import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

//check if user has changed password  , it will check before saving it to db bcoz save is given inside pre function
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//check if entered password is correct using bcrypt
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//generates accesstoken 
userSchema.methods.generateAccessToken = function(){
    try {

        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1d"
            }
        )
    } catch (error) {
        // Handle the error here, you can log it or throw it further
        console.error('Error generating access token:', error);
        throw error; // throwing the error further for handling in the calling code
    }
}

//creates refreshtoken using _id , this will be stored in db and used to recreate acces token after it is expired
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
