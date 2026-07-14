import { useLanguage } from "../../context/LanguageContext";
import { renderFormattedTitle } from "../../lib/utils";

interface Props {
  titleEn: string;
  titleUr: string;
}

export default function GenericHeader({ titleEn, titleUr }: Props) {
  const { lang } = useLanguage();
  return (
    <div className="bg-primary-900 text-white py-16 text-center print:hidden">
      <h1 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto px-4 leading-tight">
        {renderFormattedTitle(lang === "en" ? titleEn : titleUr, lang === "ur")}
      </h1>
    </div>
  );
}
