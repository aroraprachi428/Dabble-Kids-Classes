import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useListParentKids, useCreateParentKid, getListParentKidsQueryKey, useListParentBookings, getListParentBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Loader2 } from "lucide-react";

export default function ParentKids() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'parent')) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: kids, isLoading } = useListParentKids({
    query: { enabled: !!user && user.role === 'parent', queryKey: getListParentKidsQueryKey() }
  });

  const { data: bookings } = useListParentBookings({
    query: { enabled: !!user && user.role === 'parent', queryKey: getListParentBookingsQueryKey() }
  });

  const allKids = [...(kids || [])];
  if (bookings) {
    bookings.forEach(b => {
      if (b.childName && b.childAge && !allKids.find(k => k.name.toLowerCase() === b.childName.toLowerCase())) {
        allKids.push({ id: `derived-${b.id}`, name: b.childName, age: b.childAge });
      }
    });
  }

  const createKid = useCreateParentKid({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listParentKids"] });
        setName("");
        setAge("");
        setIsAdding(false);
      },
      onError: (err: any) => {
        setError(err.error?.error || "Failed to add child");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsedAge = parseInt(age, 10);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (isNaN(parsedAge) || parsedAge < 4 || parsedAge > 18) {
      setError("Age must be between 4 and 18");
      return;
    }
    createKid.mutate({ data: { name: name.trim(), age: parsedAge } });
  };

  if (isAuthLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[80vh]">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Kids Profiles</h1>
          <p className="text-muted-foreground text-lg font-medium">Manage children for quicker booking</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-full h-12 font-bold px-6 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Add Child
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 sm:p-8 rounded-[2rem] border-2 shadow-xl shadow-primary/5 bg-white mb-8 animate-in fade-in zoom-in-95">
          <h3 className="text-xl font-extrabold mb-6">Add new profile</h3>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive font-bold rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold mb-2">First Name</label>
              <Input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aryan"
                className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4"
              />
            </div>
            <div className="w-full sm:w-32 shrink-0">
              <label className="block text-sm font-bold mb-2">Age</label>
              <Input 
                type="number"
                min={4}
                max={18}
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="7"
                className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-center"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="h-14 rounded-2xl font-bold flex-1 sm:flex-none">Cancel</Button>
              <Button type="submit" disabled={createKid.isPending} className="h-14 rounded-2xl font-bold flex-1 sm:flex-none px-8">
                {createKid.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 rounded-[2rem]">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : allKids.length === 0 ? (
        !isAdding && (
          <Card className="p-12 rounded-[3rem] text-center border-2 border-dashed bg-accent/30 shadow-none">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <User className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No kids added yet</h2>
            <p className="text-muted-foreground mb-8">Save their details to make booking faster.</p>
            <Button onClick={() => setIsAdding(true)} size="lg" className="rounded-full font-bold shadow-lg shadow-primary/20">Add Child</Button>
          </Card>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allKids.map(kid => (
            <Card key={kid.id} className="p-6 rounded-[2rem] border-2 shadow-md hover:border-primary/20 transition-all bg-white flex items-center gap-4 relative overflow-hidden">
              {kid.id.startsWith('derived') && (
                <div className="absolute top-0 right-0 bg-accent text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-widest text-muted-foreground">From booking</div>
              )}
              <div className="w-14 h-14 rounded-full bg-accent text-primary flex items-center justify-center font-black text-xl shrink-0">
                {kid.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">{kid.name}</h3>
                <p className="text-sm font-bold text-muted-foreground">{kid.age} years old</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
