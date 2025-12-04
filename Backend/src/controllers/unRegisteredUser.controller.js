import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";

// 1. Get Details (Populates the form when you load the page)
export const getUnRegisteredUserDetails = asyncHandler(async (req, res) => {
    // req.user comes from the verifyJWT middleware
    const user = req.user;

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details fetched successfully"));
});

// 2. Save Registration Details (Skills, Links)
export const saveRegDetails = asyncHandler(async (req, res) => {
    // We explicitly extract ONLY these fields.
    // We DO NOT extract 'name' or 'email' so they cannot be overwritten with empty strings.
    const { 
        username, 
        linkedinLink, 
        githubLink, 
        portfolioLink, 
        skillsProficientAt, 
        skillsToLearn 
    } = req.body;

    // Basic validation
    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    // Update the user
    const updatedUser = await UnRegisteredUser.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username,
                linkedinLink,
                githubLink,
                portfolioLink,
                skillsProficientAt,
                skillsToLearn
            }
        },
        { new: true } // Return the updated document so the frontend sees the changes
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Registration details saved successfully"));
});

// 3. Save Education Details
export const saveEduDetail = asyncHandler(async (req, res) => {
    const { education } = req.body;

    const updatedUser = await UnRegisteredUser.findByIdAndUpdate(
        req.user._id,
        { $set: { education } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Education details saved successfully"));
});

// 4. Save Additional Details (Bio, Projects)
export const saveAddDetail = asyncHandler(async (req, res) => {
    const { bio, projects } = req.body;

    const updatedUser = await UnRegisteredUser.findByIdAndUpdate(
        req.user._id,
        { $set: { bio, projects } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Additional details saved successfully"));
});