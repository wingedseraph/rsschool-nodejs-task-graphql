import { Profile } from '@prisma/client';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLContext } from '../context.js';
import { MemberType, MemberTypeId } from './member.types.js';
import { UUIDType } from './uuid.js';

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (source: Profile, _args, ctx: GraphQLContext) => {
        return ctx.loaders.loadMemberTypes.load(source.memberTypeId);
      },
    },
  }),
});
