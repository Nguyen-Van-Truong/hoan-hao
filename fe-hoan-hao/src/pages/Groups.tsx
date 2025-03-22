import React, { useState } from "react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
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
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Plus,
  Calendar,
  MessageSquare,
  Settings,
  Info,
  Lock,
  Globe,
  UserPlus,
  Shield,
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  privacy: "public" | "private";
  coverImage: string;
  lastActive: string;
  isJoined: boolean;
}

const mockYourGroups: Group[] = [
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
  },
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
  },
];

const mockSuggestedGroups: Group[] = [
  {
    id: "4",
    name: "Du lịch khắp Việt Nam",
    description: "Chia sẻ kinh nghiệm du lịch và những địa điểm tuyệt vời",
    memberCount: 23456,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
    lastActive: "5 hours ago",
    isJoined: false,
  },
  {
    id: "5",
    name: "Nhiếp ảnh Việt Nam",
    description: "Chia sẻ hình ảnh và kỹ thuật chụp ảnh",
    memberCount: 15678,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    lastActive: "1 day ago",
    isJoined: false,
  },
  {
    id: "6",
    name: "Sách hay nên đọc",
    description: "Giới thiệu và thảo luận về sách hay",
    memberCount: 9876,
    privacy: "public",
    coverImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    lastActive: "2 days ago",
    isJoined: false,
  },
  {
    id: "7",
    name: "Phim Việt Nam",
    description: "Thảo luận về phim Việt Nam và quốc tế",
    memberCount: 7654,
    privacy: "private",
    coverImage:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    lastActive: "3 days ago",
    isJoined: false,
  },
];

interface Event {
  id: string;
  title: string;
  date: string;
  groupId: string;
  groupName: string;
  attendees: number;
  coverImage: string;
}

const mockEvents: Event[] = [
  {
    id: "e1",
    title: "Offline meeting - Lập trình viên Việt Nam",
    date: "2023-12-15T18:00:00",
    groupId: "3",
    groupName: "Lập trình viên Việt Nam",
    attendees: 45,
    coverImage:
      "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=800&q=80",
  },
  {
    id: "e2",
    title: "Workshop nấu ăn - Ẩm thực Việt Nam",
    date: "2023-12-20T10:00:00",
    groupId: "2",
    groupName: "Ẩm thực Việt Nam",
    attendees: 32,
    coverImage:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  },
];

interface Discussion {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  groupId: string;
  groupName: string;
  date: string;
  commentCount: number;
}

const mockDiscussions: Discussion[] = [
  {
    id: "d1",
    title: "Có nên học React Native hay Flutter?",
    author: "Nguyễn Văn A",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen",
    groupId: "3",
    groupName: "Lập trình viên Việt Nam",
    date: "2 hours ago",
    commentCount: 23,
  },
  {
    id: "d2",
    title: "Chia sẻ công thức bánh xèo miền Trung",
    author: "Trần Thị B",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tran",
    groupId: "2",
    groupName: "Ẩm thực Việt Nam",
    date: "5 hours ago",
    commentCount: 15,
  },
  {
    id: "d3",
    title: "Mèo con của tôi mới sinh, cần lời khuyên chăm sóc",
    author: "Lê Văn C",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=le",
    groupId: "1",
    groupName: "Những người yêu thích mèo",
    date: "1 day ago",
    commentCount: 42,
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
        <div className="absolute top-2 right-2">
          <Badge variant={group.privacy === "public" ? "secondary" : "outline"}>
            {group.privacy === "public" ? (
              <Globe className="h-3 w-3 mr-1" />
            ) : (
              <Lock className="h-3 w-3 mr-1" />
            )}
            {t(group.privacy === "public" ? "groups.public" : "groups.private")}
          </Badge>
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
      </CardContent>
      <CardFooter>
        {group.isJoined ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            {t("groups.viewGroup")}
          </Button>
        ) : (
          <Button className="w-full bg-pink-500 hover:bg-pink-600">
            <UserPlus className="h-4 w-4 mr-2" />
            {t("groups.join")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  const { t } = useLanguage();
  const eventDate = new Date(event.date);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-32 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <CardDescription>
          {eventDate.toLocaleDateString()}{" "}
          {eventDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {event.attendees} {t("groups.attending")}
          </span>
          <span className="mx-2">•</span>
          <span>{event.groupName}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          {t("groups.interested")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const DiscussionCard = ({ discussion }: { discussion: Discussion }) => {
  const { t } = useLanguage();

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Avatar>
            <img src={discussion.authorAvatar} alt={discussion.author} />
          </Avatar>
          <div>
            <p className="text-sm font-medium">{discussion.author}</p>
            <p className="text-xs text-muted-foreground">
              {t("time." + discussion.date)} • {discussion.groupName}
            </p>
          </div>
        </div>
        <CardTitle className="text-base">{discussion.title}</CardTitle>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <MessageSquare className="h-4 w-4 mr-1" />
          {discussion.commentCount} {t("groups.comments")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Groups = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("groups.title")}
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/groups/my")}>
                <Shield className="h-4 w-4 mr-2" />
                {t("groups.myGroups")}
              </Button>
              <Button
                className="bg-pink-500 hover:bg-pink-600"
                onClick={() => navigate("/groups/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("groups.create")}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="your-groups" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="your-groups">
              {t("groups.yourGroups")}
            </TabsTrigger>
            <TabsTrigger value="discover">{t("groups.discover")}</TabsTrigger>
            <TabsTrigger value="events">{t("groups.events")}</TabsTrigger>
          </TabsList>

          <TabsContent value="your-groups" className="space-y-6">
            {mockYourGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockYourGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {t("groups.noGroups")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t("groups.noGroupsDescription")}
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

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {t("groups.recentDiscussions")}
              </h2>
              <div className="space-y-4">
                {mockDiscussions.map((discussion) => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSuggestedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Button variant="outline">{t("groups.loadMore")}</Button>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {t("groups.upcomingEvents")}
              </h2>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {t("groups.createEvent")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {mockEvents.length === 0 && (
              <div className="text-center py-10">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {t("groups.noEvents")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t("groups.noEventsDescription")}
                </p>
                <Button>{t("groups.createEvent")}</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ThreeColumnLayout>
  );
};

export default Groups;
