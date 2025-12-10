import { useState } from "react";
import { Plus, Trash2, MapPin, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SavedDestination, PatientInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const EMOJI_OPTIONS = ["🏠", "🏢", "🏥", "🏫", "🛒", "🍔", "👵", "👴", "🎮", "⛪", "🏋️", "🌳"];

interface DestinationManagerProps {
  patient: PatientInfo;
}

const DestinationManager = ({ patient }: DestinationManagerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDest, setNewDest] = useState({ name: "", address: "", icon: "📍" });
  const [editDest, setEditDest] = useState({ name: "", address: "", icon: "" });
  const { updatePatientDestinations } = useAuth();
  const { toast } = useToast();

  const destinations = patient.destinations || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.name.trim() || !newDest.address.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both name and address.",
        variant: "destructive",
      });
      return;
    }

    const newDestination: SavedDestination = {
      id: Math.random().toString(36).substring(2, 11),
      name: newDest.name,
      address: newDest.address,
      icon: newDest.icon,
      coordinates: [1.3521, 103.8198], // Default Singapore coords
    };

    updatePatientDestinations(patient.id, [...destinations, newDestination]);
    setNewDest({ name: "", address: "", icon: "📍" });
    setIsAddOpen(false);
    toast({
      title: "Destination added",
      description: `${newDest.name} has been added to ${patient.name}'s destinations.`,
    });
  };

  const handleDelete = (destId: string) => {
    const dest = destinations.find(d => d.id === destId);
    updatePatientDestinations(patient.id, destinations.filter(d => d.id !== destId));
    toast({
      title: "Destination removed",
      description: `${dest?.name} has been removed.`,
    });
  };

  const startEdit = (dest: SavedDestination) => {
    setEditingId(dest.id);
    setEditDest({ name: dest.name, address: dest.address, icon: dest.icon });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDest({ name: "", address: "", icon: "" });
  };

  const saveEdit = (destId: string) => {
    if (!editDest.name.trim() || !editDest.address.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both name and address.",
        variant: "destructive",
      });
      return;
    }

    const updatedDestinations = destinations.map(d =>
      d.id === destId
        ? { ...d, name: editDest.name, address: editDest.address, icon: editDest.icon }
        : d
    );
    updatePatientDestinations(patient.id, updatedDestinations);
    setEditingId(null);
    toast({
      title: "Destination updated",
      description: `${editDest.name} has been updated.`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {patient.name}'s Destinations
            </CardTitle>
            <CardDescription>
              Manage saved destinations for {patient.name}
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Destination</DialogTitle>
                <DialogDescription>
                  Add a new saved destination for {patient.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          newDest.icon === emoji
                            ? "bg-primary text-primary-foreground ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => setNewDest({ ...newDest, icon: emoji })}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dest-name">Name *</Label>
                  <Input
                    id="dest-name"
                    placeholder="e.g., Day Centre"
                    value={newDest.name}
                    onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dest-address">Address *</Label>
                  <Input
                    id="dest-address"
                    placeholder="e.g., 123 Street Name, Singapore"
                    value={newDest.address}
                    onChange={(e) => setNewDest({ ...newDest, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Destination
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {destinations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No destinations yet</p>
            <p className="text-sm">Add destinations for {patient.name} to navigate to</p>
          </div>
        ) : (
          destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {editingId === dest.id ? (
                <>
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_OPTIONS.slice(0, 6).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`w-8 h-8 rounded text-lg flex items-center justify-center ${
                          editDest.icon === emoji ? "bg-primary text-primary-foreground" : "bg-background"
                        }`}
                        onClick={() => setEditDest({ ...editDest, icon: emoji })}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input
                      value={editDest.name}
                      onChange={(e) => setEditDest({ ...editDest, name: e.target.value })}
                      className="h-8"
                    />
                    <Input
                      value={editDest.address}
                      onChange={(e) => setEditDest({ ...editDest, address: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => saveEdit(dest.id)}>
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-2xl">{dest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dest.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{dest.address}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(dest)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(dest.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DestinationManager;
