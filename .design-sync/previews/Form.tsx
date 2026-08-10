import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Textarea,
  Button,
} from "tanstack_start_ts";

// `Form` is react-hook-form's FormProvider — the fields read their state from
// it, so a preview has to create a form instance and wrap the fields in it.
export const NewVocab = () => {
  const form = useForm({ defaultValues: { sw: "rafiki", de: "Freund, Freundin", note: "" } });
  return (
    <Form {...form}>
      <form className="grid w-full max-w-sm gap-4">
        <FormField
          control={form.control}
          name="sw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Swahili</FormLabel>
              <FormControl>
                <Input placeholder="z. B. rafiki" {...field} />
              </FormControl>
              <FormDescription>Grundform, ohne Artikel.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="de"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deutsch</FormLabel>
              <FormControl>
                <Input placeholder="Übersetzung" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Speichern</Button>
      </form>
    </Form>
  );
};

export const WithError = () => {
  const form = useForm({ defaultValues: { sw: "", note: "" } });
  // setError must run after the first render — calling it during render loops.
  useEffect(() => {
    form.setError("sw", { message: "Bitte gib eine Vokabel ein." });
  }, [form]);
  return (
    <Form {...form}>
      <form className="grid w-full max-w-sm gap-4">
        <FormField
          control={form.control}
          name="sw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Swahili</FormLabel>
              <FormControl>
                <Input placeholder="z. B. rafiki" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notiz</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
