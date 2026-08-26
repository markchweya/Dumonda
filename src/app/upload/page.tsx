import { DocumentUpload } from "@/components/document-upload";

export const metadata = { title: "What does this letter mean?" };

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-ink-soft">
          Beta
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          What does this letter mean?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Upload an official letter, fine or notice. Dumonda identifies the
          issuing authority, the dates and amounts it contains, and connects it
          to the right workflow. Only the extracted text is stored — you can
          delete it anytime, and it&apos;s removed with your account.
        </p>
      </div>
      <div className="mt-8">
        <DocumentUpload />
      </div>
    </div>
  );
}
