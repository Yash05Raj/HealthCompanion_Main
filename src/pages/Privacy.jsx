import { Box, Typography, Card, CardContent, Divider, List, ListItem, ListItemText, Chip } from "@mui/material";

function Privacy() {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Privacy
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Learn how Health Companion handles your data and privacy.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
        <Card elevation={0} sx={{ border: "1px solid #E5E9F0", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Data Handling & Storage
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your account information and medical records are stored securely in Firebase Authentication, Firestore, and Storage. We only store the data required to provide the service.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Authentication"
                  secondary="Used to sign you in and protect access to your account."
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Prescriptions"
                  secondary="Stored in Firestore with associated files in Firebase Storage under your user ID."
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Reminders"
                  secondary="Medication reminders and schedules are saved in Firestore and are associated with your account."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid #E5E9F0", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Security & Compliance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We follow best practices for data security. Access to your data is restricted to your authenticated account. Files are stored under a unique path scoped by your user ID.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip label="Secure" color="primary" sx={{ fontWeight: 500 }} />
              <Chip label="HIPAA-Friendly" sx={{ fontWeight: 500, backgroundColor: "#E8F0FE", color: "#0A4B94" }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid #E5E9F0", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Your Rights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can manage and remove your data directly within the app:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Delete Account"
                  secondary="From Settings, you can permanently delete your account. This removes prescriptions, reminders, and files associated with your user ID."
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Manage Prescriptions"
                  secondary="You can upload, download, and delete prescription files from the Prescriptions page."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid #E5E9F0", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Contact & Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you have concerns or requests regarding your data, please reach out to support at healthcompanion@gmail.com.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Privacy;