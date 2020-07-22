const ajv = require('ajv')({ $data: true });

require('ajv-keywords')(ajv);

const schema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: 12,
    },
    issue_text: {
      type: 'string',
    },
    created_by: {
      type: 'string',
    },
    status_text: {
      type: 'string',
    },
    assigned_to: {
      type: 'string',
    },
    open: {
      type: 'boolean',
    },
  },
  required: ['_id'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

module.exports = validate;
