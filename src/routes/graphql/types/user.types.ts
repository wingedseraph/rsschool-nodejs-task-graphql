import { Post, User } from '@prisma/client';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { GraphQLContext } from '../context.js';
import { PostType } from './posts.types.js';
import { ProfileType } from './profiles.types.js';
import { UUIDType } from './uuid.js';

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: source.id },
          include: { profile: true },
        });

        return user?.profile || null;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(PostType)),
      resolve: async (source: User, _args, ctx: GraphQLContext): Promise<Post[]> => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: source.id },
          include: { posts: true },
        });
        return user?.posts || [];
      },
    },

    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const subscriptions = await ctx.prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: source.id },
          include: { author: true },
        });
        return subscriptions.map((sub) => sub.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const subscribers = await ctx.prisma.subscribersOnAuthors.findMany({
          where: { authorId: source.id },
          include: { subscriber: true },
        });
        return subscribers.map((sub) => sub.subscriber);
      },
    },
  }),
});
