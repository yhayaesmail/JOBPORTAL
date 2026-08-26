import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { ApiError } from '../middleware/errorHandler.js';

export const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.employer.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot apply to your own job posting');
    }
    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) {
      throw new ApiError(409, 'You have already applied for this job');
    }
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      status: 'Applied',
    });
    const populated = await application.populate([
      { path: 'job', select: 'title company location jobType salary' },
      { path: 'candidate', select: 'name email' },
    ]);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application: populated },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const filter = { candidate: req.user._id };
    if (status && ['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
      filter.status = status;
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company location salary jobType description requirements')
        .populate('candidate', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: {
        count: applications.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId, status, page, limit } = req.query;
    const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
    const employerJobIds = employerJobs.map((j) => j._id);
    if (employerJobIds.length === 0) {
      res.status(200).json({
        success: true,
        data: { count: 0, total: 0, applications: [], message: 'You have not posted any jobs yet' },
      });
      return;
    }
    const filter = {};
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new ApiError(404, 'Job not found');
      }
      if (job.employer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You can only view applications for your own job postings');
      }
      filter.job = jobId;
    } else {
      filter.job = { $in: employerJobIds };
    }
    if (status && ['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
      filter.status = status;
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company location jobType salary')
        .populate('candidate', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: {
        count: applications.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view applications for your own job postings');
    }
    const { status, page, limit } = req.query;
    const filter = { job: jobId };
    if (status && ['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
      filter.status = status;
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company location jobType salary')
        .populate('candidate', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: {
        job: { id: job._id, title: job.title, company: job.company },
        count: applications.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const application = await Application.findById(id).populate('job');
    if (!application) {
      throw new ApiError(404, 'Application not found');
    }
    const job = application.job;
    let employerId;
    if (job && job.employer) {
      employerId = job.employer.toString();
    } else {
      const fetchedJob = await Job.findById(application.job);
      if (!fetchedJob) throw new ApiError(404, 'Associated job not found');
      employerId = fetchedJob.employer.toString();
    }
    if (employerId !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only update applications for your own job postings');
    }
    application.status = status;
    await application.save();
    const populated = await application.populate([
      { path: 'job', select: 'title company location jobType' },
      { path: 'candidate', select: 'name email' },
    ]);
    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: { application: populated },
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate('job', 'title company location salary jobType employer')
      .populate('candidate', 'name email');
    if (!application) {
      throw new ApiError(404, 'Application not found');
    }
    const isCandidateOwner = application.candidate._id.toString() === req.user._id.toString();
    const job = application.job;
    const isEmployerOwner = job.employer.toString() === req.user._id.toString();
    if (!isCandidateOwner && !isEmployerOwner) {
      throw new ApiError(403, 'You do not have permission to view this application');
    }
    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};
