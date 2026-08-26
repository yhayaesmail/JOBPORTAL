import Joi from 'joi';

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('Applied', 'Shortlisted', 'Rejected').required().messages({
    'any.only': 'Status must be Applied, Shortlisted or Rejected',
    'any.required': 'Status is required',
  }),
});

export const applicationIdParamSchema = Joi.object({
  id: Joi.string().required().messages({ 'any.required': 'Application ID is required' }),
});

export const jobApplicationsQuerySchema = Joi.object({
  jobId: Joi.string().allow('', null),
  status: Joi.string().valid('Applied', 'Shortlisted', 'Rejected').allow('', null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});
