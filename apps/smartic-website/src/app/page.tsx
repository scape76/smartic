import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-[400px]">
        <Tabs defaultValue="create">
          <CardHeader>
            <CardTitle>
              <TabsList>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="join">Join</TabsTrigger>
              </TabsList>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TabsContent value="create">
              <CreateRoomForm />
            </TabsContent>
            <TabsContent value="join">
              <JoinRoomForm />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </main>
  );
}
