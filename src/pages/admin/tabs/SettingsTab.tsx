import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from '@/context/SettingsContext';
import { Textarea } from '@/components/ui/textarea';

const SettingsTab: React.FC = () => {
    const { toast } = useToast();
    const { settings, updateSettings, isLoading } = useSettings();

    const handleSave = () => {
        // Since updateSettings persists to localStorage immediately in our context implementation,
        // we just show the success toast here.
        toast({
            title: "Settings Saved",
            description: "Your store preferences have been updated successfully.",
        });
    };

    const handleChange = (key: keyof typeof settings, value: string | boolean) => {
        updateSettings({ [key]: value });
    };

    if (isLoading) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Store Settings</CardTitle>
                    <CardDescription>Manage your store's general preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input
                            id="storeName"
                            value={settings.storeName}
                            onChange={(e) => handleChange('storeName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support Email</Label>
                        <Input
                            id="supportEmail"
                            value={settings.supportEmail}
                            onChange={(e) => handleChange('supportEmail', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Maintenance Mode</Label>
                            <div className="text-sm text-muted-foreground">Temporarily disable the store for visitors</div>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>New Order Alerts</Label>
                        <Switch
                            checked={settings.orderAlerts}
                            onCheckedChange={(checked) => handleChange('orderAlerts', checked)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <Label>Low Stock Warnings</Label>
                        <Switch
                            checked={settings.stockWarnings}
                            onCheckedChange={(checked) => handleChange('stockWarnings', checked)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <Label>New User Signups</Label>
                        <Switch
                            checked={settings.newSignups}
                            onCheckedChange={(checked) => handleChange('newSignups', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Homepage Banners</CardTitle>
                    <CardDescription>Customize the sliding banners on the home page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {settings.bannerSlides?.map((slide, index) => (
                        <div key={slide.id} className="border p-4 rounded-lg space-y-4 relative">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Slide {index + 1}</h4>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        const newSlides = settings.bannerSlides.filter((_, i) => i !== index);
                                        updateSettings({ bannerSlides: newSlides });
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={slide.title}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].title = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Highlight Text</Label>
                                    <Input
                                        value={slide.highlight}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].highlight = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={slide.description}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].description = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Badge Text</Label>
                                    <Input
                                        value={slide.badge}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].badge = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount Text</Label>
                                    <Input
                                        value={slide.discount}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].discount = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Image URL</Label>
                                    <Input
                                        value={slide.image}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].image = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category (for "Shop Now" link)</Label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={slide.category || ''}
                                        onChange={(e) => {
                                            const newSlides = [...settings.bannerSlides];
                                            newSlides[index].category = e.target.value;
                                            updateSettings({ bannerSlides: newSlides });
                                        }}
                                    >
                                        <option value="">All Products</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="home-living">Home & Living</option>
                                        <option value="beauty">Beauty</option>
                                        <option value="sports">Sports</option>
                                        <option value="books">Books</option>
                                        <option value="sessional-products">Sessional Products</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!settings.bannerSlides || settings.bannerSlides.length < 6) && (
                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => {
                                const newId = Math.max(0, ...settings.bannerSlides.map(s => s.id)) + 1;
                                const newSlide = {
                                    id: newId,
                                    badge: 'New Banner',
                                    title: 'Title Here',
                                    highlight: 'Highlight',
                                    description: 'Banner description goes here.',
                                    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
                                    discount: '0% OFF',
                                    bgClass: 'from-primary/20 via-secondary/30 to-accent/20',
                                    category: '',
                                };
                                updateSettings({ bannerSlides: [...settings.bannerSlides, newSlide] });
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Banner
                        </Button>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    );
};

export default SettingsTab;
