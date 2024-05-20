import mongoose, { mongo } from "mongoose";

interface IFaq extends mongoose.Document {
  question: string;
  answer: string;
}

interface ICategory extends mongoose.Document {
  title: string;
}

interface IBannerImage extends mongoose.Document {
  public_id: string;
  url: string;
}

interface ILayout extends mongoose.Document {
  type: string;
  faqs: IFaq[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subtitle: string;
  };
}

const faqSchema: mongoose.Schema<IFaq> = new mongoose.Schema<IFaq>({
  question: String,
  answer: String,
});

const categorySchema: mongoose.Schema<ICategory> =
  new mongoose.Schema<ICategory>({
    title: String,
  });

const bannerImageSchema: mongoose.Schema<IBannerImage> =
  new mongoose.Schema<IBannerImage>({
    public_id: String,
    url: String,
  });

const layoutSchema: mongoose.Schema<ILayout> = new mongoose.Schema({
  type: String,
  faqs: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: String,
    subtitle: String,
  },
});

const Layout: mongoose.Model<ILayout> = mongoose.model("Layout", layoutSchema);

export default Layout;
