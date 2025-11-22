import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './graphql-schema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

const DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const node = parse(query);
      const depthValidationErrors = validate(schema, node, [depthLimit(DEPTH_LIMIT)]);

      if (depthValidationErrors.length > 0) {
        return { data: null, errors: depthValidationErrors };
      }
      return graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma },
      });
    },
  });
};

export default plugin;
