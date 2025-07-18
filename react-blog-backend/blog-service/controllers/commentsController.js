// TODO
// 1. Import Models
// Objective: Use Mongoose models for comments and posts.
// Steps:
// Ensure Comment and Post models are imported.
const Comment = require("../models/Comments");
const Post = require("../models/Posts");

// 2. Fetch All Comments for a Post
// Objective: Retrieve all comments associated with a specific post ID.
// Steps:
// Use Comment.find() to fetch comments where post matches req.params.id.
// Use populate() to include details about the author (e.g., name and email).
// Handle errors by wrapping the logic in a try...catch block.
// Return the fetched comments as a JSON response.
exports.getAllComments = async (req, res) => {
  const postId = req.params.id;
  try {
    const allComments = await Comment.find({ post: postId }).populate(
      "content author post"
    );
    res.json({ allComments });
  } catch (error) {
    console.error("Error fetching comments:", error); // Detailed error logging

    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

// 3. Fetch a Single Comment by ID
// Objective: Retrieve a specific comment using its ID.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Use populate() to include author details.
// Check if the comment exists; if not, return a 404 Not Found response.
// Handle errors and return a JSON response with the comment or error message.
exports.getCommentById = async (req, res) => {
  const commentId = req.params.id;
  try {
    const chosenComment = await Comment.findById(commentId).populate(
      "content author post"
    );
    if (!chosenComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ chosenComment });
  } catch (error) {
    console.error("Error fetching comment:", error); // Detailed error logging

    res
      .status(500)
      .json({ message: "Failed to fetch comment", error: error.message });
  }
};

// 4. Add a New Comment
// Objective: Add a comment to a specific post.
// Steps:
// Extract content from req.body.
// Use Post.findById() to verify the existence of the post associated with req.params.id.
// Create a new comment with the content, author (from req.user.id), and post ID.
// Save the comment using comment.save().
// Update the post's comments array by pushing the new comment's ID and saving the post.
// Handle errors and return a success response with the created comment.
exports.createComment = async (req, res) => {
  const { content } = req.body;
  try {
    const chosenPost = await Post.findById(req.params.id);
    if (!chosenPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.id,
    });
    await comment.save();
    chosenPost.comments.push(comment._id);
    await chosenPost.save();
    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error); // Detailed error logging
    res
      .status(500)
      .json({ message: "Failed to fetch comment", error: error.message });
  }
};

// 5. Edit a Comment
// Objective: Allow the author to edit their comment.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Verify the comment exists; if not, return a 404 Not Found response.
// Check if the logged-in user (req.user.id) matches the comment's author.
// Update the comment's content with the new value from req.body.content.
// Save the updated comment using comment.save().
// Handle errors and return a success response with the updated comment.
exports.editCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (req.user.id !== comment.author.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not the Author. You may not edit this comment",
        });
    }
    comment.content = req.body.content || comment.content;
    await comment.save();
    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error); // Detailed error logging
    res
      .status(500)
      .json({ message: "Failed to fetch comment", error: error.message });
  }
};

// 6. Delete a Comment
// Objective: Allow the author to delete their comment.
// Steps:
// Use Comment.findById() to fetch the comment by req.params.id.
// Verify the comment exists; if not, return a 404 Not Found response.
// Check if the logged-in user (req.user.id) matches the comment's author.
// Use comment.deleteOne() to delete the comment from the database.
// Update the associated post by removing the comment ID from its comments array using Post.updateOne() with $pull.
// Handle errors and return a success response.
exports.deleteCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (req.user.id !== comment.author.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not the Author. You may not edit this comment",
        });
    }
    await Post.updateOne(
      { _id: comment.post },
      { $pull: { comments: comment._id } }
    );
    await comment.deleteOne();
    res.status(200).json({
      message: "Comment deleted successfully",
      comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error); // Detailed error logging
    res
      .status(500)
      .json({ message: "Failed to fetch comment", error: error.message });
  }
};

// 7. Integrate with Routes
// Objective: Connect these controller functions to the Express routes.
// Steps:
// Import these functions into the comments router file.
// Define the routes and attach the corresponding controller functions:
// GET /comments/:id → getComments
// POST /comments/:id → addComment
// PUT /comments/:id → editComment
// DELETE /comments/:id → deleteComment
