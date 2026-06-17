import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class FruitBowl extends JPanel {
    private List<HobbyCard> cards = new ArrayList<>();

    private static final Hobby[] HOBBIES = {
        new Hobby("Math",             "🍎"),
        new Hobby("Science",          "🍋"),
        new Hobby("Art",              "🍉"),
        new Hobby("History",          "🍊"),
        new Hobby("English",          "🍋"),
        new Hobby("World Language",   "🍇"),
        new Hobby("Music",            "🍓"),
        new Hobby("Sports",           "🍌"),
        new Hobby("Extra-Curriculars","🍍"),
    };

    public FruitBowl() {
        setLayout(new BorderLayout(0, 16));
        setBackground(new Color(0x38167d));
        setBorder(BorderFactory.createEmptyBorder(24, 32, 24, 32));

        JLabel title = new JLabel("F R U I T   B O W L", SwingConstants.CENTER);
        title.setFont(new Font("Arial", Font.BOLD, 26));
        title.setForeground(Color.WHITE);
        title.setBorder(BorderFactory.createEmptyBorder(0, 0, 8, 0));

        JLabel subtitle = new JLabel("Choose your passion", SwingConstants.CENTER);
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));
        subtitle.setForeground(new Color(200, 180, 255));

        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(new Color(0x38167d));
        headerPanel.add(title, BorderLayout.CENTER);
        headerPanel.add(subtitle, BorderLayout.SOUTH);

        JPanel grid = new JPanel(new GridLayout(3, 3, 12, 12));
        grid.setBackground(new Color(0x38167d));

        for (Hobby h : HOBBIES) {
            HobbyCard card = new HobbyCard(h);
            cards.add(card);
            grid.add(card);
        }

        JButton continueBtn = new JButton("Continue →");
        continueBtn.setFont(new Font("Arial", Font.BOLD, 15));
        continueBtn.setBackground(new Color(0xf0c040));
        continueBtn.setForeground(new Color(0x38167d));
        continueBtn.setFocusPainted(false);
        continueBtn.setBorder(BorderFactory.createEmptyBorder(10, 28, 10, 28));
        continueBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        continueBtn.addActionListener(e -> onContinue());

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        btnPanel.setBackground(new Color(0x38167d));
        btnPanel.add(continueBtn);

        add(headerPanel, BorderLayout.NORTH);
        add(grid, BorderLayout.CENTER);
        add(btnPanel, BorderLayout.SOUTH);
    }

    private void onContinue() {
        String selected = null;
        for (HobbyCard card : cards) {
            if (card.getHobby().isSelected()) {
                selected = card.getHobby().getName();
                break;
            }
        }
        if (selected == null) {
            JOptionPane.showMessageDialog(this,
                "Pick a passion to continue!",
                "Choose a fruit", JOptionPane.INFORMATION_MESSAGE);
        } else {
            JPanel wip = new JPanel(new BorderLayout());
            wip.setBackground(new Color(0x38167d));
            JLabel wipLabel = new JLabel("🚧 WIP 🚧", SwingConstants.CENTER);
            wipLabel.setFont(new Font("Dialog", Font.BOLD, 48));
            wipLabel.setForeground(new Color(0xf0c040));
            wip.add(wipLabel, BorderLayout.CENTER);

            JFrame frame = (JFrame) SwingUtilities.getWindowAncestor(this);
            frame.setContentPane(wip);
            frame.revalidate();
            frame.repaint();
        }
    }
}
