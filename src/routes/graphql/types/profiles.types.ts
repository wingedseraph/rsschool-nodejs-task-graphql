import { Profile } from '@prisma/client';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLContext } from '../context.js';
import { MemberType } from './member.types.js';
import { UUIDType } from './uuid.js';

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (source: Profile, _args, ctx: GraphQLContext) => {
        const profile = await ctx.prisma.profile.findUnique({
          where: { id: source.id },
          include: { memberType: true },
        });

        if (!profile) return null;

        return profile.memberType;
      },
    },
  }),
});
