const ajv = require('ajv')({ $data: true });

require('ajv-keywords')(ajv);

const schema = {
  type: 'object',
  properties: {
    issue_title: {
      type: 'string',
      minLength: 1,
    },
    issue_text: {
      type: 'string',
      minLength: 1,
    },
    created_by: {
      type: 'string',
      minLength: 1,
    },
    status_text: {
      type: 'string',
    },
    assigned_to: {
      type: 'string',
    },
  },
  required: ['issue_title', 'issue_text', 'created_by'],
  additionalProperties: true,
};

const validate = ajv.compile(schema);

module.exports = validate;
