const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs"); 
const { encrypt, decrypt } = require("../../utils/decrypt");
const deliveryBoySchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Full name must be at least 3 characters long"],
            maxlength: [50, "Full name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        phoneNumber: {
            type: Number,
            required: [true, "Phone number is required"],
            unique: true,
            validate: {
                validator: function (v) {
                    return /^[0-9]{10}$/.test(v);
                },
                message: "Phone number must be exactly 10 digits",
            },
        },
        userId: {
            type: String,
            required: [true, "User ID is required"],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
        },
        encryptedPassword: {
            type: String,
            select: false,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [10, "Address must be at least 10 characters long"],
        },
        branch: {
            type: String,
            required: [true, "Branch is required"],
            trim: true,
        },
        image: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted:{
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
);


  
deliveryBoySchema.statics.encrypt = encrypt;
deliveryBoySchema.statics.decrypt = decrypt;

// Method for password comparison
deliveryBoySchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Virtual field to generate full details
deliveryBoySchema.virtual("fullDetails").get(function () {
    return `${this.fullName} (${this.userId}) - ${this.email}`;
});

// Method to get decrypted password
deliveryBoySchema.methods.getPlainPassword = function () {
    return decrypt(this.encryptedPassword);
  };


// ✅ Compile the model AFTER defining all schema methods
const DeliveryBoyModel = model("DeliveryBoy", deliveryBoySchema);
module.exports = DeliveryBoyModel;
