/**
 * @file class ApiFeatures
 */
module.exports = class {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * 1) Filtering.
   *
   * @returns {object} this.
   */
  filter() {
    const queryObj = { ...this.queryString };
    // Prepare ignored query string fields.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // Exclude each `excludedFields`entry from `queryObj`.
    excludedFields.forEach(el => delete queryObj[el]);

    // 1.1) Advanced filtering.
    let queryStr = JSON.stringify(queryObj);
    // Add $ to operators in order to work with accordly with mongo operators.
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    );

    // Find in mongo based on the queryStr.
    this.query = this.query.find(queryStr);

    // Add ability of chain methods.
    return this;
  }

  /**
   * 2) Sorting.
   *
   * @returns {object} this.
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // Sort query based on the field that was given in the request.
      // ASC = <field>; DESC = -<field>;
      this.query = this.query.sort(sortBy);
    } else {
      // If request has no sorting use createdAt DESC.
      this.query = this.query.sort('-createdAt');
    }

    // Add ability of chain methods.
    return this;
  }

  /**
   * 3) Field Limiting.
   *
   * @returns {object} this.
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // E.g.: fields = 'name duration price'
      this.query = this.query.select(fields);
    } else {
      // -<field> excludes the field from select.
      this.query = this.query.select('-__v');
    }

    return this;
  }

  /**
   * 4) Pagination.
   *
   * @returns {object} this.
   */
  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
