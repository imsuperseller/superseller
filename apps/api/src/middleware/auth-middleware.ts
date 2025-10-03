import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Customer } from '../models/Customer';

interface AuthRequest extends Request {
  customer?: any;
  tenant?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get customer from database
    const customer = await Customer.findById(decoded.customerId);
    if (!customer) {
      return res.status(401).json({ error: 'Invalid token. Customer not found.' });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({ error: 'Account is inactive.' });
    }

    // Add customer and tenant info to request
    req.customer = customer;
    req.tenant = customer.tenant;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const tenantMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subdomain } = req.params;
    
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain is required.' });
    }

    // Get tenant from database
    const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
    if (!customer) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({ error: 'Tenant account is inactive.' });
    }

    // Add tenant info to request
    req.tenant = customer.tenant;
    req.customer = customer;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
