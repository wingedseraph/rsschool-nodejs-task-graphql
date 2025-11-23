import {  User } from '@prisma/client';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { GraphQLContext } from './context.js';
import { Subs } from './loaders.js';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
} from './types/mutation.types.js';
import { PostType } from './types/posts.types.js';
import { ProfileType } from './types/profiles.types.js';
import { UserType } from './types/user.types.js';
import { UUIDType } from './types/uuid.js';
import { MemberType, MemberTypeId } from './types/member.types.js';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberType),
        resolve(_source, _args, ctx: GraphQLContext) {
          return ctx.prisma.memberType.findMany();
        },
      },

      posts: {
        type: new GraphQLList(PostType),
        resolve(_source, _args, ctx: GraphQLContext) {
          return ctx.prisma.post.findMany();
        },
      },

      users: {
        type: new GraphQLList(UserType),
        resolve: async (_source, _args, ctx: GraphQLContext, resolveInfo) => {
          const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
          const fields = parsedResolveInfoFragment?.fieldsByTypeName?.UserType;
          const includeArgs: Subs = {};

          if (fields && 'userSubscribedTo' in fields) {
            includeArgs.userSubscribedTo = true;
          }

          if (fields && 'subscribedToUser' in fields) {
            includeArgs.subscribedToUser = true;
          }

          const users = await ctx.prisma.user.findMany({ include: includeArgs });

          const idsToPrime = new Set<string>();
          const userMap = new Map<string, User>();

          users.forEach((user) => {
            userMap.set(user.id, user);
            if (includeArgs.userSubscribedTo) {
              user.userSubscribedTo.forEach(({ authorId }) => {
                idsToPrime.add(authorId);
              });
            }

            if (includeArgs.subscribedToUser) {
              user.subscribedToUser?.forEach(({ subscriberId }) => {
                idsToPrime.add(subscriberId);
              });
            }
          });

          idsToPrime.forEach((id) => {
            const user = userMap.get(id);
            if (user) {
              ctx.loaders.loadUsers.prime(id, user);
            }
          });

          return users;
        },
      },

      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: (_source, _args, ctx: GraphQLContext) => {
          return ctx.prisma.profile.findMany();
        },
      },

      memberType: {
        type: MemberType,
        args: {
          id: {
            type: new GraphQLNonNull(MemberTypeId),
          },
        },
        resolve: (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          return ctx.prisma.memberType.findUnique({ where: { id } });
        },
      },

      post: {
        type: PostType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          return ctx.prisma.post.findUnique({ where: { id } });
        },
      },

      user: {
        type: UserType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          return ctx.loaders.loadUsers.load(id);
        },
      },

      profile: {
        type: ProfileType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          return ctx.prisma.profile.findUnique({
            where: { id },
          });
        },
      },
    },
  }),

  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: UserType,
        args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
        resolve: (
          _source,
          { dto }: { dto: { name: string; balance: number } },
          ctx: GraphQLContext,
        ) => {
          return ctx.prisma.user.create({ data: dto });
        },
      },

      createPost: {
        type: PostType,
        args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
        resolve: (
          _source,
          { dto }: { dto: { authorId: string; title: string; content: string } },
          ctx: GraphQLContext,
        ) => {
          return ctx.prisma.post.create({ data: dto });
        },
      },

      createProfile: {
        type: ProfileType,
        args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
        resolve: (
          _source,
          {
            dto,
          }: {
            dto: {
              userId: string;
              memberTypeId: string;
              isMale: boolean;
              yearOfBirth: number;
            };
          },
          ctx: GraphQLContext,
        ) => {
          return ctx.prisma.profile.create({ data: dto });
        },
      },

      deleteUser: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          ctx.loaders.loadUsers.clear(id);
          await ctx.prisma.user.delete({ where: { id } });

          return null;
        },
      },

      deletePost: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          await ctx.prisma.post.delete({ where: { id } });

          return null;
        },
      },

      deleteProfile: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_source, { id }: { id: string }, ctx: GraphQLContext) => {
          await ctx.prisma.profile.delete({ where: { id } });

          return null;
        },
      },

      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
        },
        resolve(
          _source,
          { id, dto }: { id: string; dto: { name: string; balance: number } },
          ctx: GraphQLContext,
        ) {
          ctx.loaders.loadUsers.clear(id);
          return ctx.prisma.user.update({ where: { id }, data: dto });
        },
      },

      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInput) },
        },
        resolve(
          _source,
          { id, dto }: { id: string; dto: { title: string; content: string } },
          ctx: GraphQLContext,
        ) {
          return ctx.prisma.post.update({ where: { id }, data: dto });
        },
      },

      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
        },
        resolve(
          _source,
          {
            id,
            dto,
          }: {
            id: string;
            dto: {
              isMale: boolean;
              yearOfBirth: number;
              memberTypeId: string;
            };
          },
          ctx: GraphQLContext,
        ) {
          return ctx.prisma.profile.update({ where: { id }, data: dto });
        },
      },

      subscribeTo: {
        type: UserType,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve(
          _source,
          { userId, authorId }: { userId: string; authorId: string },
          ctx: GraphQLContext,
        ) {
          console.log('subscribeTo mutation called:', { userId, authorId });
          ctx.loaders.loadUsers.clear(userId);
          return ctx.prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId: authorId,
            },
          }).then(() => {
            return ctx.prisma.user.findUnique({ where: { id: userId } });
          }).catch(error => {
            console.error('subscribeTo error:', error);
            throw error;
          });
        },
      },

      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _source,
          { userId, authorId }: { userId: string; authorId: string },
          ctx: GraphQLContext,
        ) => {
          console.log('unsubscribeFrom mutation called:', { userId, authorId });
          ctx.loaders.loadUsers.clear(userId);
          await ctx.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          }).catch(error => {
            console.error('unsubscribeFrom error:', error);
            throw error;
          });

          return null;
        },
      },
    },
  }),
});
