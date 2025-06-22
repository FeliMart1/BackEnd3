// utils/validators.js
import Joi from 'joi';

// Auth validation
export const signupSchema = Joi.object({
  first_name: Joi.string().min(1).required(),
  last_name:  Joi.string().min(1).required(),
  email:      Joi.string().email().required(),
  password:   Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// Pet creation validation
export const petSchema = Joi.object({
  name:        Joi.string().min(1).required(),
  species:     Joi.string().min(1).required(),
  breed:       Joi.string().optional(),
  age:         Joi.number().integer().min(0).required(),
  description: Joi.string().optional(),
  imageUrl:    Joi.string().uri().optional(),
  status:      Joi.string().valid('available','adopted').optional(),
});

// Pet update (partial) validation
export const petUpdateSchema = Joi.object({
  name:        Joi.string().min(1).optional(),
  species:     Joi.string().min(1).optional(),
  breed:       Joi.string().optional(),
  age:         Joi.number().integer().min(0).optional(),
  description: Joi.string().optional(),
  imageUrl:    Joi.string().uri().optional(),
  status:      Joi.string().valid('available','adopted').optional(),
}).min(1);

// Adoption request validation
export const adoptionRequestSchema = Joi.object({
  petId: Joi.string().hex().length(24).required(),
});

// User update validation
export const userUpdateSchema = Joi.object({
  first_name: Joi.string().min(1).optional(),
  last_name:  Joi.string().min(1).optional(),
  email:      Joi.string().email().optional(),
  age:        Joi.number().integer().min(0).optional(),
}).min(1);
