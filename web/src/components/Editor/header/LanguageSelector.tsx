import { DEFAULT_LANGUAGE } from "../../constants";
import { Language } from "../../interface";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface LanguageSelectorProps {
  onLanguageChange: (value: Language) => void;
  language: Language;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
  language,
}) => (
  <Select onValueChange={onLanguageChange} value={language}>
    <SelectTrigger className="w-[140px] bg-white text-gray-700 border border-gray-200 shadow-sm rounded-md">
      <SelectValue placeholder="Language" />
    </SelectTrigger>
    <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
      {DEFAULT_LANGUAGE.map((el) => (
        <SelectItem
          key={el}
          value={el}
          className="hover:bg-gray-50 text-gray-700"
        >
          {el.charAt(0).toUpperCase() + el.slice(1)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
