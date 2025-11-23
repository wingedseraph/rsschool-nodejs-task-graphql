import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export type Subs = {
  userSubscribedTo?: true;
  subscribedToUser?: true;
};

export type SubsId = {
  subscriberId: string;
  authorId: string;
};


export const createLoaders = (prisma: PrismaClient) => {
  return {
    loadUsers: new DataLoader(async (ids: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(ids) } },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));

      return ids.map((id) => userMap.get(id) || null);
    }),
    loadPosts: new DataLoader(async (userIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: Array.from(userIds) } },
      });

      const postsMap = new Map<string, unknown[]>();
      posts.forEach((post) => {
        const authorId = post.authorId;
        if (!postsMap.has(authorId)) {
          postsMap.set(authorId, []);
        }
        postsMap.get(authorId)?.push(post);
      });

      return userIds.map((id) => postsMap.get(id) || []);
    }),

    loadProfiles: new DataLoader(async (userIds: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: Array.from(userIds) } },
      });

      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      return userIds.map((id) => profileMap.get(id) || null);
    }),

    loadMemberTypes: new DataLoader(async (ids: readonly string[]) => {
      const types = await prisma.memberType.findMany({
        where: { id: { in: Array.from(ids) } },
      });

      const typeMap = new Map(types.map((t) => [t.id, t]));

      return ids.map((id) => typeMap.get(id) || null);
    }),

    loadUserSubscribedTo: new DataLoader(async (userIds: readonly string[]) => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: Array.from(userIds) } },
      });

      const subscriptionsMap = new Map<string, unknown[]>();
      subscriptions.forEach((sub) => {
        const subscriberId = sub.subscriberId;
        if (!subscriptionsMap.has(subscriberId)) {
          subscriptionsMap.set(subscriberId, []);
        }
        subscriptionsMap.get(subscriberId)?.push(sub);
      });

      return userIds.map((id) => subscriptionsMap.get(id) || []);
    }),

    loadSubscribedToUser: new DataLoader(async (userIds: readonly string[]) => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: Array.from(userIds) } },
      });

      const subscriptionsMap = new Map<string, unknown[]>();
      subscriptions.forEach((sub) => {
        const authorId = sub.authorId;
        if (!subscriptionsMap.has(authorId)) {
          subscriptionsMap.set(authorId, []);
        }
        subscriptionsMap.get(authorId)?.push(sub);
      });

      return userIds.map((id) => subscriptionsMap.get(id) || []);
    }),
  };
};
