import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class HobbyCard extends JPanel {
    private Hobby hobby;
    private JLabel emojiLabel;
    private JLabel nameLabel;
    private boolean hovered = false;
    private boolean selected = false;

    public HobbyCard(Hobby hobby) {
        this.hobby = hobby;
        setLayout(new BorderLayout(4, 4));
        setPreferredSize(new Dimension(140, 160));
        setBackground(new Color(0x4a2080));
        setBorder(BorderFactory.createLineBorder(new Color(0x5a30a0), 2));
        setCursor(new Cursor(Cursor.HAND_CURSOR));

        emojiLabel = new JLabel(hobby.getEmoji(), SwingConstants.CENTER);
        emojiLabel.setFont(new Font("Dialog", Font.PLAIN, 40));
        emojiLabel.setBorder(BorderFactory.createEmptyBorder(12, 8, 4, 8));
        emojiLabel.setOpaque(false);

        nameLabel = new JLabel(hobby.getName(), SwingConstants.CENTER);
        nameLabel.setFont(new Font("Arial", Font.BOLD, 14));
        nameLabel.setForeground(Color.WHITE);
        nameLabel.setOpaque(false);

        add(emojiLabel, BorderLayout.CENTER);
        add(nameLabel, BorderLayout.SOUTH);

        MouseAdapter ma = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                selectThis();
            }

            @Override
            public void mouseEntered(MouseEvent e) {
                hovered = true;
                updateStyle();
            }

            @Override
            public void mouseExited(MouseEvent e) {
                hovered = false;
                updateStyle();
            }
        };

        addMouseListener(ma);
        emojiLabel.addMouseListener(ma);
        nameLabel.addMouseListener(ma);
    }

    private void selectThis() {
        hobby.setSelected(true);
        selected = true;
        if (getParent() != null) {
            for (Component c : getParent().getComponents()) {
                if (c instanceof HobbyCard && c != HobbyCard.this) {
                    ((HobbyCard) c).deselect();
                }
            }
        }
        updateStyle();
    }

    public void deselect() {
        selected = false;
        hobby.setSelected(false);
        updateStyle();
    }

    private void updateStyle() {
        if (selected) {
            setBackground(new Color(0xf0c040));
            setBorder(BorderFactory.createLineBorder(Color.WHITE, 2));
            nameLabel.setForeground(new Color(0x38167d));
        } else if (hovered) {
            setBackground(new Color(0x5a30a0));
            setBorder(BorderFactory.createLineBorder(new Color(0xf0c040), 2));
            nameLabel.setForeground(Color.WHITE);
        } else {
            setBackground(new Color(0x4a2080));
            setBorder(BorderFactory.createLineBorder(new Color(0x5a30a0), 2));
            nameLabel.setForeground(Color.WHITE);
        }
        repaint();
    }

    public Hobby getHobby() { return hobby; }
}
