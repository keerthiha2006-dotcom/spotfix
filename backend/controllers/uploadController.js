const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const uploadImageLocally = async (file) => {
  const uploadsDirectory = path.join(__dirname, "../uploads");
  await fs.promises.mkdir(uploadsDirectory, { recursive: true });

  const extension = file.mimetype.split("/")[1].replace("jpeg", "jpg");
  const filename = `${crypto.randomUUID()}.${extension}`;
  await fs.promises.writeFile(path.join(uploadsDirectory, filename), file.buffer);

  return {
    secure_url: `/uploads/${filename}`,
    public_id: filename,
  };
};

const uploadImageToCloudinary = async (file, folder) => {
  if (!hasCloudinaryConfig()) {
    return uploadImageLocally(file);
  }

  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
    resource_type: "image",
  });

  return result;
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No image file uploaded.");
    }

    const result = await uploadImageToCloudinary(
      req.file,
      "spotfixai/complaints"
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No profile image uploaded.");
    }

    const result = await uploadImageToCloudinary(
      req.file,
      "spotfixai/profile-images"
    );

    req.user.profileImage = result.secure_url;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      imageUrl: result.secure_url,
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

const removeProfileImage = async (req, res, next) => {
  try {
    req.user.profileImage = "";
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image removed successfully.",
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadProfileImage,
  removeProfileImage,
};