import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }).min(1, "URL is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface UrlFormProps {
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

export default function UrlForm({ onSubmit, initialUrl = "" }: UrlFormProps) {
  const [url, setUrl] = useState(initialUrl);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: initialUrl || "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.url);
  };

  const handleGoClick = () => {
    const currentUrl = form.getValues().url;
    if (formSchema.safeParse({ url: currentUrl }).success) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const clearInput = () => {
    form.reset({ url: "" });
    setUrl("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="relative flex-grow">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-l-md focus:ring-2 focus:ring-primary focus:border-primary"
                  onChange={(e) => {
                    field.onChange(e);
                    setUrl(e.target.value);
                  }}
                />
              </FormControl>
              {url && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 flex items-center justify-center"
                  onClick={clearInput}
                  aria-label="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </FormItem>
          )}
        />
        <div className="flex">
          <Button 
            type="button"
            onClick={handleGoClick}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-none transition duration-150 ease-in-out"
          >
            Go
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-r-md transition duration-150 ease-in-out flex items-center"
          >
            <span>Analyze</span>
            <Search className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
