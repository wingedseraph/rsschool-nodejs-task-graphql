import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import { GraphQLContext } from './context.js';
import { MemberType, MemberTypeId } from './types/member.types.js';
import {
  ArgsWithDto,
  ChangePost,
  ChangePostInput,
  ChangeProfile,
  ChangeProfileInput,
  ChangeUser,
  ChangeUserInput,
  CreatePost,
  CreatePostInput,
  CreateProfile,
  CreateProfileInput,
  CreateUser,
  CreateUserInput,
} from './types/mutation.types.js';
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
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: UserType,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInput) },
        },
        resolve: async (_source, args: ArgsWithDto<CreateUser>, ctx: GraphQLContext) => {
          const { dto } = args;
          return ctx.prisma.user.create({
            data: dto,
          });
        },
      },
      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInput) },
        },
        resolve: async (
          _source,
          args: ArgsWithDto<CreateProfile>,
          ctx: GraphQLContext,
        ) => {
          const { dto } = args;
          return ctx.prisma.profile.create({
            data: dto,
          });
        },
      },
      createPost: {
        type: PostType,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInput) },
        },
        resolve: async (_source, args: ArgsWithDto<CreatePost>, ctx: GraphQLContext) => {
          const { dto } = args;
          return ctx.prisma.post.create({
            data: dto,
          });
        },
      },
      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
        },
        resolve: async (
          _source,
          args: { id: string; dto: ChangeUser },
          ctx: GraphQLContext,
        ) => {
          const { id, dto } = args;
          return ctx.prisma.user.update({
            where: { id },
            data: dto,
          });
        },
      },
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
        },
        resolve: async (
          _source,
          args: { id: string; dto: ChangeProfile },
          ctx: GraphQLContext,
        ) => {
          const { id, dto } = args;
          return ctx.prisma.profile.update({
            where: { id },
            data: dto,
          });
        },
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInput) },
        },
        resolve: async (
          _source,
          args: { id: string; dto: ChangePost },
          ctx: GraphQLContext,
        ) => {
          const { id, dto } = args;
          return ctx.prisma.post.update({
            where: { id },
            data: dto,
          });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, args: { id: string }, ctx: GraphQLContext) => {
          const { id } = args;
          await ctx.prisma.user.delete({
            where: { id },
          });
          return true;
        },
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, args: { id: string }, ctx: GraphQLContext) => {
          const { id } = args;
          await ctx.prisma.profile.delete({
            where: { id },
          });
          return true;
        },
      },
      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_source, args: { id: string }, ctx: GraphQLContext) => {
          const { id } = args;
          await ctx.prisma.post.delete({
            where: { id },
          });
          return true;
        },
      },
      subscribeTo: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _source,
          args: { userId: string; authorId: string },
          ctx: GraphQLContext,
        ) => {
          const { userId, authorId } = args;
          await ctx.prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId: authorId,
            },
          });
        },
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _source,
          args: { userId: string; authorId: string },
          ctx: GraphQLContext,
        ) => {
          const { userId, authorId } = args;
          await ctx.prisma.subscribersOnAuthors.deleteMany({
            where: {
              subscriberId: userId,
              authorId: authorId,
            },
          });
        },
      },
    },
  }),
});
