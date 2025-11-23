import { User } from '@prisma/client';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from 'graphql';
import { GraphQLContext } from '../context.js';
import { SubsId } from '../loaders.js';
import { MemberType } from './member.types.js';
import { PostType } from './posts.types.js';
import { ProfileType } from './profiles.types.js';
import { UUIDType } from './uuid.js';

export const UserType: GraphQLOutputType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        return ctx.loaders.loadProfiles.load(source.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(PostType)),
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        return ctx.loaders.loadPosts.load(source.id);
      },
    },

    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const subscriptions = (await ctx.loaders.loadUserSubscribedTo.load(
          source.id,
        )) as SubsId[];

        if (!subscriptions || subscriptions.length === 0) return [];

        const authorIds = subscriptions.map((sub) => sub.authorId);
        const users = await Promise.all(
          authorIds.map((id) => ctx.loaders.loadUsers.load(id)),
        );

        return users.filter((user) => user !== null);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const subscriptions = (await ctx.loaders.loadSubscribedToUser.load(
          source.id,
        )) as SubsId[];

        if (!subscriptions || subscriptions.length === 0) return [];

        const subscriberIds = subscriptions.map((sub) => sub.subscriberId);
        const users = await Promise.all(
          subscriberIds.map((id) => ctx.loaders.loadUsers.load(id)),
        );

        return users.filter((user): user is User => user !== null);
      },
    },
    memberType: {
      type: MemberType,
      resolve: async (source: User, _args, ctx: GraphQLContext) => {
        const profile = await ctx.loaders.loadProfiles.load(source.id);
        if (!profile) return null;
        return ctx.loaders.loadMemberTypes.load(profile.memberTypeId);
      },
    },
  }),
});
