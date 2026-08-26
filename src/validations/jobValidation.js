import Joi from 'joi';

export const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'any.required': 'Job title is required',
  }),
  company: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Company name is required',
  }),
  location: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Location is required',
  }),
  salary: Joi.number().min(0).required().messages({
    'any.required': 'Salary is required',
  }),
  description: Joi.string().trim().min(10).max(5000).required().messages({
    'any.required': 'Job description is required',
  }),
  requirements: Joi.string().trim().min(5).max(5000).required().messages({
    'any.required': 'Job requirements are required',
  }),
  jobType: Joi.string().valid('Full-time', 'Part-time', 'Internship').required().messages({
    'any.only': 'Job type must be Full-time, Part-time or Internship',
    'any.required': 'Job type is required',
  }),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120),
  company: Joi.string().trim().min(2).max(100),
  location: Joi.string().trim().min(2).max(100),
  salary: Joi.number().min(0),
  description: Joi.string().trim().min(10).max(5000),
  requirements: Joi.string().trim().min(5).max(5000),
  jobType: Joi.string().valid('Full-time', 'Part-time', 'Internship'),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const jobQuerySchema = Joi.object({
  search: Joi.string().trim().allow('', null),
  location: Joi.string().trim().allow('', null),
  jobType: Joi.string().valid('Full-time', 'Part-time', 'Internship').allow('', null),
  company: Joi.string().trim().allow('', null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('newest', 'oldest', 'salary_asc', 'salary_desc').default('newest'),
});

export const jobIdParamSchema = Joi.object({
  id: Joi.string().required().messages({ 'any.required': 'Job ID is required' }),
});

export const jobIdForApplySchema = Joi.object({
  jobId: Joi.string().required().messages({ 'any.required': 'Job ID is required' }),
});
