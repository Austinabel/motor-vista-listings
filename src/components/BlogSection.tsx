
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

const articles = [
  {
    title: "5 Things to Check Before Buying a Used Car",
    excerpt: "Essential tips for making a smart used car purchase...",
    author: "Car Expert",
    date: "Dec 10, 2024",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop",
  },
  {
    title: "Best Car Models for Nigerian Roads",
    excerpt: "Discover which vehicles perform best in our conditions...",
    author: "Auto Specialist",
    date: "Dec 8, 2024",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop",
  },
  {
    title: "Car Maintenance Tips for Nigerian Climate",
    excerpt: "Keep your vehicle running smoothly in tropical weather...",
    author: "Mechanic Pro",
    date: "Dec 5, 2024",
    image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=400&h=250&fit=crop",
  },
];

export const BlogSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Latest Articles</h2>
          <Button variant="outline" className="bg-background text-primary border-primary hover:bg-primary hover:text-primary-foreground">View All Articles</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{article.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{article.date}</span>
                </div>
                <Button variant="link" className="p-0">Read More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
