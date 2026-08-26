import Job from '../models/Job.js';
import { ApiError } from '../middleware/errorHandler.js';

export const createJob = async (req, res, next) => {
  try {
    const { title, company, location, salary, description, requirements, jobType } = req.body;
    const job = await Job.create({
      title,
      company,
      location,
      salary,
      description,
      requirements,
      jobType,
      employer: req.user._id,
    });
    const populated = await job.populate('employer', 'name email');
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job: populated },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, company, page, limit, sort } = req.query;
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (jobType) {
      filter.jobType = jobType;
    }
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'salary_asc') sortOption = { salary: 1 };
    if (sort === 'salary_desc') sortOption = { salary: -1 };
    if (filter.$text && sort === 'newest') {
      sortOption = { score: { $meta: 'textScore' } };
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const projection = filter.$text ? { score: { $meta: 'textScore' } } : {};
    const [jobs, total] = await Promise.all([
      Job.find(filter, projection).populate('employer', 'name email').sort(sortOption).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: {
        count: jobs.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        jobs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email role');
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only update your own job postings');
    }
    const allowedFields = ['title', 'company', 'location', 'salary', 'description', 'requirements', 'jobType'];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key];
      }
    }
    await job.save();
    await job.populate('employer', 'name email');
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only delete your own job postings');
    }
    await job.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).populate('employer', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { count: jobs.length, jobs },
    });
  } catch (err) {
    next(err);
  }
};
