import { DEFAULT_THEME } from "../../constants";
import { Theme } from "../../interface";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface ThemeSelectorProps {
  onThemeChange: (value: Theme) => void;
  theme: Theme;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onThemeChange,
  theme,
}) => (
  <Select onValueChange={onThemeChange} value={theme}>
    <SelectTrigger className="w-[140px] bg-white text-gray-700 border border-gray-200 shadow-sm rounded-md">
      <SelectValue placeholder="Theme" />
    </SelectTrigger>
    <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
      {DEFAULT_THEME.map((el) => (
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
