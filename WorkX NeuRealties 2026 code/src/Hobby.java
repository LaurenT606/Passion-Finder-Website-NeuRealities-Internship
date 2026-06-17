public class Hobby {
    private String name;
    private String emoji;
    private boolean selected;

    public Hobby(String name, String emoji) {
        this.name = name;
        this.emoji = emoji;
        this.selected = false;
    }

    public String getName() { return name; }
    public String getEmoji() { return emoji; }
    public boolean isSelected() { return selected; }
    public void setSelected(boolean selected) { this.selected = selected; }

    @Override
    public String toString() {
        return emoji + " " + name + (selected ? " [✓]" : "");
    }
}
