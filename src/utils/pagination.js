
export const getPagination = (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
};

export const getPaginationMeta = ({ total, page, limit }) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};