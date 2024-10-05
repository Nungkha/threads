"use client";

import React, { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";

import { useUploadThing } from "@/lib/uploadthing";

interface Props {
  user: {
    id: string;
    objectId: string;
    name: string;
    username: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
  const [files, setFiles] = useState<File[]>([]);

  const { startUpload } = useUploadThing("media");

  // 1. Define your form.
  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      name: user?.name || "",
      profile_photo: user?.image || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);

    if (hasImageChanged) {
      // startUpload(files) is a function from UploadThing that uploads the selected files.
      // imgRes will contain the response from the file upload, typically an array of file metadata (such as URLs, file names, etc.).
      const imgRes = await startUpload(files); //files contains the image file(s) the user has selected (managed through the setFiles function).

      // checks if imgRes exists, and checks that the first file of imgRes has URL of uploaded image
      if (imgRes && imgRes[0].fileUrl) {
        values.profile_photo = imgRes[0].fileUrl; //updates the profile_photo field of the form's values object with the URL of the newly uploaded image
      }
    }

    // TODO: Update user profile
  };

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>, // Event triggered when the file input changes
    fieldChange: (value: string) => void // A function passed from the form's field for updating its value
  ) => {
    e.preventDefault(); // Prevents the default behavior of the input form (e.g., navigating away).

    // The FileReader is a built-in JS API that allows web applications to asynchronously read the contents of files
    // (such as images, text, or binary data) stored on the user's computer.
    // It's commonly used to read files selected via an HTML <input type="file"> element.
    const fileReader = new FileReader(); // Creates a new FileReader instance to read the selected file.

    // Check if the input element has files and that there is at least one file selected.
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; // Gets the first selected file.

      // Updates the `files` state with the selected files as an array (though it handles only one file for now).
      setFiles(Array.from(e.target.files));

      // Ensure the selected file is an image (checking the MIME type).
      if (!file.type.includes("image")) return;

      // This event handler is triggered once the file has been read.
      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ""; // Converts the file into a Base64 Data URL.

        fieldChange(imageDataUrl); // Updates the form field's value with the Base64 Data URL.
      };

      // Reads the file as a Data URL (which is a Base64-encoded string representing the image).
      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        {/* upload profile picture */}
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="profile photo"
                    width={96}
                    height={96}
                    priority
                    className="rounded-full object-contain"
                  />
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="profile photo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  className="account-form_image-input"
                  placeholder="Upload a photo"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2 ">
                Name
              </FormLabel>
              <FormControl>
                <Input type="text" className="account-form_input" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* username field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2 ">
                Username
              </FormLabel>
              <FormControl>
                <Input type="text" className="account-form_input" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* bio field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2 ">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea rows={10} className="account-form_input" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="bg-primary-500" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;
