import { Request, Response, NextFunction } from 'express';

export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: 'Start date and end date are required'
    });
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      error: 'Invalid date format'
    });
  }

  if (start > end) {
    return res.status(400).json({
      error: 'Start date must be before end date'
    });
  }

  next();
};

export const validateAsset = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, type, amount } = req.body;

  if (!name || !type || amount === undefined) {
    return res.status(400).json({
      error: 'Name, type and amount are required'
    });
  }

  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({
      error: 'Amount must be a positive number'
    });
  }

  next();
}; 