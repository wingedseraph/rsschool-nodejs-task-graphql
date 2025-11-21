import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { GraphQLContext } from './context.js';
import { MemberType, MemberTypeId } from './types/member.types.js';
import { PostType } from './types/posts.types.js';
import { ProfileType } from './types/profiles.types.js';
import { UserType } from './types/user.types.js';
import { UUIDType } from './types/uuid.js';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
        resolve: async (_source, _args, ctx: GraphQLContext) =>
          ctx.prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeId) },
        },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.prisma.memberType.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: async (_source, _args, ctx: GraphQLContext) =>
          ctx.prisma.user.findMany(),
      },
      user: {
        // todo: fix that type issue
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.prisma.user.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
        resolve: async (_source, _args, ctx: GraphQLContext) =>
          ctx.prisma.post.findMany(),
      },
      post: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.prisma.post.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
        resolve: async (_source, _args, ctx: GraphQLContext) =>
          ctx.prisma.profile.findMany(),
      },
      profile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.prisma.profile.findUnique({ where: { id } }),
      },
    },
  }),
  // mutation: new GraphQLObjectType({
  //   name: 'RootMutationType',
  //   fields: {},
  // }),
});
