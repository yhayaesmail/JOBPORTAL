export const validate = (schemas) => (req, res, next) => {
  const errors = {};
  for (const [key, schema] of Object.entries(schemas)) {
    if (!schema) continue;
    const { error, value } = schema.validate(req[key], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      errors[key] = error.details.map((d) => d.message);
    } else {
      req[key] = value;
    }
  }
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};
