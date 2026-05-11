const BlogCategory = require("../models/BlogCategoryModel");
const Blog = require("../models/BlogModel");
const { validationResult } = require("express-validator");

const multer = require("multer");
const fs = require("fs");
const path = require('path');

// Set S3 endpoint to DigitalOcean Spaces
;


const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
} else {
    console.log('Images directory exists:', imagesDir);
}

// Set up multer to store uploaded files in ./images folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir); // Specify the directory to save the file temporarily
    },
    filename: (req, file, cb) => {
        const timestamp = moment().format('YYYYMMDDHHmmssSSS');
        const filename = `${timestamp}${path.extname(file.originalname)}`;
        console.log('Saving file as:', filename); // Debug log
        cb(null, filename);
    }
});

const upload_local = multer({
    storage: storage,
    limits: {
        fileSize: 10000000 // 10MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
            return cb(new Error('Only image/pdf files are allowed!'));
        }
        cb(null, true);
    }
}).array("upload", 1);


exports.blogCategoryById = (req, res, next, id) => {
    BlogCategory.findById(id).exec((err, blogCategory) => {
        if (err || !blogCategory) {
            return res.status(400).json({
                error: "Blog Category not exist",
            });
        }
        req.blogCategory = blogCategory;
        next();
    });
};

exports.createBlogCategory = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["name"] = req.body.name;
        where["deleted"] = 0;

        BlogCategory.findOne(where).then((response) => {
            if (response != null) {
                res.status(200).send({
                    status: "error",
                    message: "Blog Category exist in the database.",
                });
            } else {
                const blogCategory = new BlogCategory({
                    name: req.body.name,
                });
                blogCategory.save((err) => {
                    if (err) {
                        return res.status(400).json({
                            error: err,
                        });
                    }
                    res.status(200).json({
                        message: "Blog Category Created Successfully",
                    });
                });
            }
        });
    }
};

exports.updateBlogCategory = (req, res) => {
    const blogCategory = req.blogCategory;
    blogCategory.name = req.body.name;
    blogCategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json(data);
    });
};

exports.viewBlogCategory = (req, res) => {
    BlogCategory.find()
        .sort("createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).json({
                message: "Blog Category found.",
                data: data,
            });
        });
};

exports.deleteBlogCategory = (req, res) => {
    const blogCategory = req.blogCategory;
    blogCategory.remove((err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json({ message: "Blog Category deleted Successfully" });
    });
};

exports.blogById = (req, res, next, id) => {
    Blog.findById(id).exec((err, blog) => {
        if (err || !blog) {
            return res.status(400).json({
                error: "Blog not exist",
            });
        }
        req.blog = blog;
        next();
    });
};

exports.createBlog = (req, res) => {
    upload_local(req, res, function (error) {
        // console.log(req.body.categories)
        if (error) {
            res.status(200).send({
                status: "error",
                message: error.message,
                token: req.token,
            });
        } else {
            if (req.files.length > 0) {
                const file = req.files[0]; // Get the first (and only) file from the array
                const image_data = {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    filename: file.filename,
                    location: `https://${req.get('host')}/images/${file.filename}`, // Construct the location URL
                    size: file.size
                };

                let blogData = new Blog({
                    title: req.body.title,
                    description: req.body.html,
                    categories: req.body.categories,
                    image: image_data.location,
                    seo_title: req.body.seo_title,
                    seo_description: req.body.seo_description,
                    seo_keywords: req.body.seo_keywords,
                });
                blogData.save(function (err) {
                    if (err) {
                        res.status(200).send({
                            status: "error",
                            message: err,
                            token: req.token,
                        });
                    } else {
                        res.status(200).send({
                            status: "success",
                            message: "Blog has been created successfully.",
                        });
                    }
                });
            } else {
                let blogData = new Blog({
                    title: req.body.title,
                    description: req.body.html,
                    categories: req.body.categories,
                    seo_title: req.body.seo_title,
                    seo_description: req.body.seo_description,
                    seo_keywords: req.body.seo_keywords,
                });

                blogData.save(function (err) {
                    if (err) {
                        res.status(200).send({
                            status: "error",
                            message: err,
                            token: req.token,
                        });
                    } else {
                        res.status(200).send({
                            status: "success",
                            message: "Blog has been created successfully.",
                        });
                    }
                });
            }
        }
    });
};

exports.singleBlog = (req, res) => {
    res.json(req.blog);
};

exports.updateBlog = (req, res) => {
    upload_local(req, res, function (error) {
        if (error) {
            res.status(200).send({
                status: "error",
                message: error.message,
                token: req.token,
            });

            ////
        } else {
            let where = {};
            where["_id"] = req.query.id;
            let updatedata = {};
            updatedata["title"] = req.body.title;
            updatedata["description"] = req.body.html;
            updatedata["categories"] = req.body.categories;
            updatedata["seo_title"] = req.body.seo_title;
            updatedata["seo_description"] = req.body.seo_description;
            updatedata["seo_keywords"] = req.body.seo_keywords;

            const file = req.files[0]; // Get the first (and only) file from the array
            const image_data = {
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                filename: file.filename,
                location: `https://${req.get('host')}/images/${file.filename}`, // Construct the location URL
                size: file.size
            };

            if (req.files[0]) {
                updatedata["image"] = image_data.location;
            }

            Blog.findOneAndUpdate(where, updatedata, {
                new: true,
            })
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Blog has been updated..",
                        token: req.token,
                    });
                });
        }
    });
};

exports.viewBlogUser = (req, res) => {
    let where = {};
    where["active"] = 0;
    Blog.find(where)
        .populate("blog_category")
        .sort("-createdAt")
        .limit(9)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.json(data);
        });
};

exports.viewBlogAdmin = (req, res) => {
    Blog.find()
        .populate("blog_category")
        .sort("-createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.json(data);
        });
};

exports.deleteBlog = (req, res) => {
    let blog = req.blog;
    blog.remove((err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json({
            message: "Blog Deleted Successfully",
        });
    });
};

exports.singleBlog = (req, res) => {
    let where = {};
    where["active"] = 0;

    if (req.query.slug) {
        where["slug"] = req.query.slug;
    }
    if (req.query.id) {
        where["_id"] = req.query.id;
    }
    Blog.find(where).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.status(200).send({
            status: "success",
            message: "Blog Found",
            data: data,
        });
    });
};

exports.blogByCategory = (req, res) => {
    let where = {};
    where["active"] = 0;

    let blogWithCategory = [];
    Blog.find(where).then((resp) => {
        resp &&
            resp.map((b) => {
                if (b.categories) {
                    b.categories &&
                        b.categories.map((c) => {
                            if (c == req.body.name) {
                                blogWithCategory.push(b);
                            }
                        });
                }
            });
        res.status(200).send({
            status: "success",
            data: blogWithCategory,
        });
    });
};

exports.updateBlogStatus = (req, res) => {
    let where = {};
    where["_id"] = req.body.id;
    Blog.findOneAndUpdate(
        where,
        {
            active: req.body.active,
        },
        { new: true }
    )
        .exec()
        .then(() => {
            res.status(200).send({
                status: "success",
                message: "Status updated",
            });
        })
        .catch(function (error) {
            res.status(200).send({
                status: "error",
                message: error.message,
            });
        });
};
