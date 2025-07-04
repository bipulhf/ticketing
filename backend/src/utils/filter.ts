export interface DateFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface FilterOptions {
  dateFilter?: DateFilter;
  status?: string;
  userId?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const buildDateFilter = (
  startDate?: string,
  endDate?: string
): DateFilter | undefined => {
  if (!startDate && !endDate) {
    return undefined;
  }

  const filter: DateFilter = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      // Set to start of day
      start.setHours(0, 0, 0, 0);
      filter.startDate = start;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      // Set to end of day
      end.setHours(23, 59, 59, 999);
      filter.endDate = end;
    }
  }

  return filter;
};

export const buildPrismaDateFilter = (dateFilter?: DateFilter) => {
  if (!dateFilter) {
    return {};
  }

  const { startDate, endDate } = dateFilter;

  if (startDate && endDate) {
    return {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  if (startDate) {
    return {
      createdAt: {
        gte: startDate,
      },
    };
  }

  if (endDate) {
    return {
      createdAt: {
        lte: endDate,
      },
    };
  }

  return {};
};

export const buildPaginationFilter = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
};

export const calculatePaginationInfo = (
  total: number,
  page: number = 1,
  limit: number = 10
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

export const sanitizeQueryParams = (params: Record<string, any>) => {
  const sanitized: Record<string, any> = {};

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      sanitized[key] = value;
    }
  });

  return sanitized;
};
