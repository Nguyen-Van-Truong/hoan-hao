import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Plus,
  Settings,
  Lock,
  Globe,
  Edit,
  MoreHorizontal,
  Shield,
  Calendar,
  MessageSquare,
  Bell,
  BellOff,
  UserPlus,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  privacy: "public" | "private";
  coverImage: string;
  lastActive: string;
  isJoined: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  pendingPosts?: number;
  pendingMembers?: number;
  unreadMessages?: number;
}

const mockMyCreatedGroups: Group[] = [
  {
    id: "1",
    name: "Những người yêu thích mèo",
    description:
      "Chia sẻ hình ảnh và câu chuyện về những chú mèo đáng yêu của bạn",
    memberCount: 5243,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    lastActive: "1 hour ago",
    isJoined: true,
    isOwner: true,
    isAdmin: true,
    pendingPosts: 5,
    pendingMembers: 12,
    unreadMessages: 8,
  },
  {
    id: "2",
    name: "Ẩm thực Việt Nam",
    description: "Chia sẻ công thức nấu ăn và địa điểm ăn uống ngon",
    memberCount: 12876,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
    lastActive: "3 hours ago",
    isJoined: true,
    isOwner: true,
    isAdmin: true,
    pendingPosts: 2,
    pendingMembers: 5,
    unreadMessages: 0,
  },
];

const mockAdminGroups: Group[] = [
  {
    id: "3",
    name: "Lập trình viên Việt Nam",
    description:
      "Cộng đồng chia sẻ kiến thức và cơ hội việc làm trong ngành IT",
    memberCount: 8765,
    privacy: "private",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    lastActive: "2 days ago",
    isJoined: true,
    isOwner: false,
    isAdmin: true,
    pendingPosts: 15,
    pendingMembers: 8,
    unreadMessages: 3,
  },
  {
    id: "4",
    name: "Du lịch khắp Việt Nam",
    description: "Chia sẻ kinh nghiệm du lịch và những địa điểm tuyệt vời",
    memberCount: 23456,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
    lastActive: "5 hours ago",
    isJoined: true,
    isOwner: false,
    isAdmin: true,
    pendingPosts: 0,
    pendingMembers: 0,
    unreadMessages: 0,
  },
];

const GroupCard = ({ group }: { group: Group }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-32 overflow-hidden">
        <img
          src={group.coverImage}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant={group.privacy === "public" ? "secondary" : "outline"}>
            {group.privacy === "public" ? (
              <Globe className="h-3 w-3 mr-1" />
            ) : (
              <Lock className="h-3 w-3 mr-1" />
            )}
            {t(group.privacy === "public" ? "groups.public" : "groups.private")}
          </Badge>
          {group.isOwner && (
            <Badge variant="outline" className="bg-pink-100">
              <Shield className="h-3 w-3 mr-1" />
              {t("groups.owner")}
            </Badge>
          )}
          {!group.isOwner && group.isAdmin && (
            <Badge variant="outline" className="bg-blue-100">
              <Shield className="h-3 w-3 mr-1" />
              {t("groups.admin")}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{group.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {group.memberCount.toLocaleString()} {t("groups.members")}
          </span>
          <span className="mx-2">•</span>
          <span>{t("time." + group.lastActive)}</span>
        </div>

        {group.pendingPosts || group.pendingMembers || group.unreadMessages ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {group.pendingPosts > 0 && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {group.pendingPosts} {t("groups.pendingPosts")}
              </Badge>
            )}
            {group.pendingMembers > 0 && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                {group.pendingMembers} {t("groups.pendingMembers")}
              </Badge>
            )}
            {group.unreadMessages > 0 && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Bell className="h-3 w-3 mr-1" />
                {group.unreadMessages} {t("groups.unreadMessages")}
              </Badge>
            )}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="flex-1 mr-2"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          {t("groups.viewGroup")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("groups.options")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/groups/${group.id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("groups.settings")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/groups/${group.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("groups.edit")}
            </DropdownMenuItem>
            {group.pendingPosts > 0 && (
              <DropdownMenuItem
                onClick={() => navigate(`/groups/${group.id}/moderation`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("groups.reviewPosts")}
              </DropdownMenuItem>
            )}
            {group.pendingMembers > 0 && (
              <DropdownMenuItem
                onClick={() => navigate(`/groups/${group.id}/members/pending`)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("groups.reviewMembers")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigate(`/groups/${group.id}/events/create`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t("groups.createEvent")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {group.unreadMessages > 0 ? (
              <DropdownMenuItem>
                <BellOff className="h-4 w-4 mr-2" />
                {t("groups.muteNotifications")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                {t("groups.enableNotifications")}
              </DropdownMenuItem>
            )}
            {group.isOwner && (
              <DropdownMenuItem className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                {t("groups.deleteGroup")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

const MyGroups = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter groups based on search query
  const filteredCreatedGroups = mockMyCreatedGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAdminGroups = mockAdminGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("groups.myGroups")}
          </h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("groups.search")}
                className="pl-9 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-pink-500 hover:bg-pink-600"
              onClick={() => navigate("/groups/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("groups.create")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="created">
              {t("groups.createdByYou")}
            </TabsTrigger>
            <TabsTrigger value="admin">{t("groups.adminRights")}</TabsTrigger>
            <TabsTrigger value="all">{t("groups.allGroups")}</TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="space-y-6">
            {filteredCreatedGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCreatedGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchQuery
                    ? t("groups.noSearchResults")
                    : t("groups.noCreatedGroups")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? t("groups.tryDifferentSearch")
                    : t("groups.createGroupDescription")}
                </p>
                <Button
                  className="bg-pink-500 hover:bg-pink-600"
                  onClick={() => navigate("/groups/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("groups.create")}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            {filteredAdminGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAdminGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchQuery
                    ? t("groups.noSearchResults")
                    : t("groups.noAdminGroups")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? t("groups.tryDifferentSearch")
                    : t("groups.adminGroupsDescription")}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {filteredCreatedGroups.length > 0 ||
            filteredAdminGroups.length > 0 ? (
              <div className="space-y-8">
                {filteredCreatedGroups.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {t("groups.createdByYou")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCreatedGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                    </div>
                  </div>
                )}

                {filteredAdminGroups.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {t("groups.adminRights")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAdminGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchQuery
                    ? t("groups.noSearchResults")
                    : t("groups.noGroups")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? t("groups.tryDifferentSearch")
                    : t("groups.noGroupsDescription")}
                </p>
                <Button
                  className="bg-pink-500 hover:bg-pink-600"
                  onClick={() => navigate("/groups/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("groups.create")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-pink-500">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user"
                alt="Your avatar"
              />
            </Avatar>
            <div>
              <h3 className="font-medium">{t("groups.groupManagement")}</h3>
              <p className="text-sm text-gray-500">
                {t("groups.groupManagementDescription")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/groups/create")}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("groups.createNew")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/groups/invitations")}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t("groups.invitations")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/groups/discover")}
            >
              <Globe className="h-4 w-4 mr-1" />
              {t("groups.discover")}
            </Button>
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
};

export default MyGroups;
