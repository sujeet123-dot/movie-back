class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const exclude = ['page', 'limit', 'sort', 'fields', 'search'];
    const queryObj = { ...this.queryString };
    exclude.forEach((key) => delete queryObj[key]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = ['title', 'excerpt']) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, 'i');
      const orConditions = fields.map((f) => ({ [f]: regex }));
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-publishedAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
