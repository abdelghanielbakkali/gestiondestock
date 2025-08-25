// src/components/InputField.jsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function InputField({ label, name, type = "text", placeholder, value, onChange }) {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <Label htmlFor={name} className="text-base font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl"
      />
    </div>
  )
}
