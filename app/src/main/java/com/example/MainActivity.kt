package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ui.theme.*

// Mock database storage structures for Role based view toggling under Phase 2 specifications
data class UserSessionState(
  val email: String,
  val firstName: String,
  val lastName: String,
  val roleName: String, // SUPER_ADMIN, SOCIETY_ADMIN, OWNER, TENANT
  val permissions: List<String>
)

data class Bill(
  val id: String,
  val invoiceNumber: String,
  val period: String,
  val amount: Double,
  val status: String, // UNPAID, PAID
  val dueDate: String
)

data class ComplaintTicket(
  val id: String,
  val ticketNumber: String,
  val category: String,
  val priority: String, // LOW, MEDIUM, HIGH, URGENT
  val subject: String,
  val description: String,
  var status: String, // OPEN, RESOLVED, CLOSED
  val raisedBy: String,
  val createdAt: String
)

data class NoticeItem(
  val id: String,
  val title: String,
  val content: String,
  val date: String,
  val target: String
)

data class FlatUnitItem(
  val id: String,
  val flatNumber: String,
  val wing: String,
  val building: String,
  val type: String,
  val ownership: String,
  val occupancy: String,
  val area: String
)

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        MainSessionRouter()
      }
    }
  }
}

@Composable
fun MainSessionRouter() {
  // Global Session Manager State
  var loggedInSession by remember { mutableStateOf<UserSessionState?>(null) }

  AnimatedContent(
    targetState = loggedInSession,
    transitionSpec = {
      fadeIn() togetherWith fadeOut()
    },
    label = "SessionTransition"
  ) { session ->
    if (session == null) {
      AuthLoginScreen(
        onLoginSuccess = { email, role ->
          val (first, last, perms) = when (role) {
            "SUPER_ADMIN" -> Triple("Albus", "Dumbledore", listOf("society.create", "society.delete", "settings.manage"))
            "SOCIETY_ADMIN" -> Triple("Remus", "Lupin", listOf("building.create", "wing.create", "flat.create", "maintenance.generate", "notice.create", "complaint.assign"))
            "OWNER" -> Triple("Jayesh", "Panchal", listOf("flat.view", "complaint.create", "notice.view", "payment.view"))
            else -> Triple("Harry", "Potter", listOf("flat.view", "complaint.create", "notice.view")) // TENANT
          }
          loggedInSession = UserSessionState(email, first, last, role, perms)
        }
      )
    } else {
      DashboardMainStage(
        session = session,
        onLogoutRequested = {
          loggedInSession = null
        }
      )
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthLoginScreen(onLoginSuccess: (String, String) -> Unit) {
  var emailInput by remember { mutableStateOf("") }
  var passwordInput by remember { mutableStateOf("") }
  var passwordVisible by remember { mutableStateOf(false) }
  var errorMessage by remember { mutableStateOf<String?>(null) }
  var loadingState by remember { mutableStateOf(false) }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(SlateBackground)
      .systemBarsPadding()
      .padding(24.dp),
    contentAlignment = Alignment.Center
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(20.dp))
        .background(SlateCard)
        .border(1.dp, SlateBorder, RoundedCornerShape(20.dp))
        .padding(24.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      // Branding Header
      Box(
        modifier = Modifier
          .size(52.dp)
          .clip(RoundedCornerShape(12.dp))
          .background(EmeraldCore),
        contentAlignment = Alignment.Center
      ) {
        Text("CS", fontWeight = FontWeight.Bold, color = OnPrimaryDark, fontSize = 24.sp)
      }

      Spacer(modifier = Modifier.height(14.dp))

      Text(
        text = "Housing Workspace Login",
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White
      )
      Text(
        text = "Secure Admin & Resident Platform Gateway",
        fontSize = 11.sp,
        color = EmeraldLight,
        textAlign = TextAlign.Center
      )

      Spacer(modifier = Modifier.height(24.dp))

      // Username / Email input fields
      OutlinedTextField(
        value = emailInput,
        onValueChange = { emailInput = it; errorMessage = null },
        label = { Text("Registered Email", fontSize = 12.sp, color = TextMuted) },
        placeholder = { Text("admin@society.com", fontSize = 12.sp, color = TextMuted) },
        singleLine = true,
        leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email Input icon", tint = TextMuted) },
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = EmeraldCore,
          unfocusedBorderColor = SlateBorder,
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White,
          focusedContainerColor = SlateBackground,
          unfocusedContainerColor = SlateBackground
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("email_input")
      )

      Spacer(modifier = Modifier.height(14.dp))

      // Password input fields
      OutlinedTextField(
        value = passwordInput,
        onValueChange = { passwordInput = it; errorMessage = null },
        label = { Text("Security Password", fontSize = 12.sp, color = TextMuted) },
        singleLine = true,
        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Password input icon", tint = TextMuted) },
        trailingIcon = {
          IconButton(onClick = { passwordVisible = !passwordVisible }) {
            Icon(
              imageVector = if (passwordVisible) Icons.Default.FavoriteBorder else Icons.Default.Favorite,
              contentDescription = "Toggle password visible",
              tint = TextMuted
            )
          }
        },
        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = EmeraldCore,
          unfocusedBorderColor = SlateBorder,
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White,
          focusedContainerColor = SlateBackground,
          unfocusedContainerColor = SlateBackground
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("password_input")
      )

      // Dynamic Error state warning banners
      AnimatedVisibility(visible = errorMessage != null) {
        Column {
          Spacer(modifier = Modifier.height(12.dp))
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(8.dp))
              .background(CrimsonAlert.copy(alpha = 0.15f))
              .border(1.dp, CrimsonAlert.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
              .padding(10.dp)
          ) {
            Text(errorMessage ?: "", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Primary Authentication Trigger
      Button(
        onClick = {
          if (emailInput.isBlank() || passwordInput.isBlank()) {
            errorMessage = "Please fulfill all required username and password blocks."
          } else {
            loadingState = true
            // Secure Verification parameters matching Database Seeder
            when {
              emailInput == "superadmin@example.com" && passwordInput == "Admin@123" -> {
                onLoginSuccess(emailInput, "SUPER_ADMIN")
              }
              emailInput == "admin@society.com" && passwordInput == "Admin@123" -> {
                onLoginSuccess(emailInput, "SOCIETY_ADMIN")
              }
              emailInput == "owner@example.com" && passwordInput == "Owner@123" -> {
                onLoginSuccess(emailInput, "OWNER")
              }
              emailInput == "tenant@example.com" && passwordInput == "Tenant@123" -> {
                onLoginSuccess(emailInput, "TENANT")
              }
              else -> {
                errorMessage = "Invalid email credentials. Please check password criteria."
              }
            }
            loadingState = false
          }
        },
        colors = ButtonDefaults.buttonColors(containerColor = EmeraldCore),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("sign_in_button")
      ) {
        Text("Sign In Securely", color = OnPrimaryDark, fontWeight = FontWeight.Bold, fontSize = 14.sp)
      }

      Spacer(modifier = Modifier.height(24.dp))
      Divider(color = SlateBorder)
      Spacer(modifier = Modifier.height(14.dp))

      // Sandbox helper buttons
      Text(
        "Seeded Credentials Shortcuts:",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = TextMuted,
        modifier = Modifier.align(Alignment.Start)
      )

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Button(
          onClick = { emailInput = "admin@society.com"; passwordInput = "Admin@123" },
          colors = ButtonDefaults.buttonColors(containerColor = SlateBorder),
          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
          shape = RoundedCornerShape(6.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("Admin Desk", fontSize = 10.sp, color = TextLight, fontWeight = FontWeight.Bold)
        }
        Button(
          onClick = { emailInput = "owner@example.com"; passwordInput = "Owner@123" },
          colors = ButtonDefaults.buttonColors(containerColor = SlateBorder),
          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
          shape = RoundedCornerShape(6.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("Owner Flat", fontSize = 10.sp, color = TextLight, fontWeight = FontWeight.Bold)
        }
        Button(
          onClick = { emailInput = "tenant@example.com"; passwordInput = "Tenant@123" },
          colors = ButtonDefaults.buttonColors(containerColor = SlateBorder),
          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
          shape = RoundedCornerShape(6.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("Tenant", fontSize = 10.sp, color = TextLight, fontWeight = FontWeight.Bold)
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardMainStage(
  session: UserSessionState,
  onLogoutRequested: () -> Unit
) {
  val context = LocalContext.current
  var activeTab by remember { mutableStateOf(0) }
  var showAddComplaintDialog by remember { mutableStateOf(false) }

  // Extract Permission details dynamically
  val hasBillingPermission = session.permissions.contains("payment.view") || session.roleName == "SUPER_ADMIN" || session.roleName == "SOCIETY_ADMIN"
  val hasComplaintCreatePermission = session.permissions.contains("complaint.create")

  // Sample State logs
  val billsList = remember {
    mutableStateListOf(
      Bill("1", "INV-2026-101", "June 2026", 1700.0, "UNPAID", "25 Jun 2026"),
      Bill("2", "INV-2026-102", "May 2026", 1700.0, "PAID", "25 May 2026")
    )
  }

  val complaintsList = remember {
    mutableStateListOf(
      ComplaintTicket(
        "1", "TKT-309", "Plumbing", "HIGH",
        "Water leakage from ceiling in kitchen",
        "Leaking water near main water control hub of floor 1.",
        "OPEN", "Jayesh Panchal (F-101)", "08 Jun 2026"
      ),
      ComplaintTicket(
        "2", "TKT-312", "Electrical", "URGENT",
        "Corridor lights blinking in Wing B2",
        "Multiple tube fixtures have burned transformer starters.",
        "OPEN", "Harry Potter (Tenant)", "07 Jun 2026"
      )
    )
  }

  val noticesList = remember {
    mutableStateListOf(
      NoticeItem(
        "1", "Annual General Meeting (AGM) 2026",
        "General committee operations will review budgets, ledger balance, and billing rules on June 21, 2026 at the clubhouse foyer.",
        "08 Jun 2026", "ALL"
      )
    )
  }

  val flatsList = remember {
    mutableStateListOf(
      FlatUnitItem("1", "101", "A1", "Building A", "2BHK", "Owned", "SelfOccupied", "950 SqFt"),
      FlatUnitItem("2", "102", "A1", "Building A", "2BHK", "Rented", "TenantOccupied", "950 SqFt"),
      FlatUnitItem("3", "103", "A1", "Building A", "2BHK", "Vacant", "Vacant", "950 SqFt"),
      FlatUnitItem("4", "104", "A2", "Building A", "3BHK", "Owned", "SelfOccupied", "1200 SqFt"),
      FlatUnitItem("5", "101", "B1", "Building B", "2BHK", "Owned", "SelfOccupied", "950 SqFt"),
      FlatUnitItem("6", "102", "B2", "Building B", "2BHK", "Vacant", "Vacant", "950 SqFt")
    )
  }

  Scaffold(
    topBar = {
      TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = SlateCard,
          titleContentColor = TextLight
        ),
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(
              modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(EmeraldCore),
              contentAlignment = Alignment.Center
            ) {
              Text("CS", color = OnPrimaryDark, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            Column {
              Text(
                text = "Green Heights Co-op",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
              )
              Text(
                text = "${session.firstName} ${session.lastName} (${session.roleName})",
                fontSize = 11.sp,
                color = EmeraldLight
              )
            }
          }
        },
        actions = {
          // System Logout Action
          IconButton(
            onClick = {
              onLogoutRequested()
              Toast.makeText(context, "Session logged out securely.", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier.testTag("logout_btn")
          ) {
            Icon(
              imageVector = Icons.Default.ExitToApp,
              contentDescription = "Safe Logout Option",
              tint = CrimsonAlert
            )
          }
        }
      )
    },
    bottomBar = {
      NavigationBar(
        containerColor = SlateCard,
        tonalElevation = 8.dp
      ) {
        val navItems = listOf(
          Triple("Portal", Icons.Default.Home, 0),
          Triple("Accounts", Icons.Default.ShoppingCart, 1),
          Triple("Ticketing", Icons.Default.Warning, 2),
          Triple("Notices", Icons.Default.Notifications, 3),
          Triple("Blueprint", Icons.Default.List, 4)
        )

        navItems.forEach { (label, icon, index) ->
          NavigationBarItem(
            icon = { Icon(icon, contentDescription = label) },
            label = { Text(label, fontSize = 11.sp) },
            selected = activeTab == index,
            onClick = { activeTab = index },
            colors = NavigationBarItemDefaults.colors(
              selectedIconColor = OnPrimaryDark,
              selectedTextColor = EmeraldCore,
              indicatorColor = EmeraldCore,
              unselectedIconColor = TextMuted,
              unselectedTextColor = TextMuted
            ),
            modifier = Modifier.testTag("tab_$index")
          )
        }
      }
    },
    floatingActionButton = {
      // Permission-Based FAB Toggle: "Every mobile screen must show/hide based on permission"
      if (activeTab == 2 && hasComplaintCreatePermission) {
        FloatingActionButton(
          onClick = { showAddComplaintDialog = true },
          containerColor = EmeraldCore,
          contentColor = OnPrimaryDark,
          modifier = Modifier.testTag("add_ticket_fab")
        ) {
          Icon(Icons.Default.Add, contentDescription = "Add Complaint Ticket")
        }
      }
    }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(SlateBackground)
        .padding(innerPadding)
    ) {
      when (activeTab) {
        0 -> PortalMainTab(session, billsList, complaintsList, noticesList)
        1 -> {
          // Render billing or restrict matching permission scheme
          if (hasBillingPermission) {
            BillingTabScreen(session, billsList) { idx ->
              val curBill = billsList[idx]
              if (curBill.status == "UNPAID") {
                billsList[idx] = curBill.copy(status = "PAID")
                Toast.makeText(context, "Payment simulation processed. Invoice receipt updated.", Toast.LENGTH_SHORT).show()
              }
            }
          } else {
            PermissionRestrictedFallback(requiredSpec = "payment.view")
          }
        }
        2 -> {
          ComplaintsTabScreen(session, complaintsList) { id ->
            val idx = complaintsList.indexOfFirst { it.id == id }
            if (idx != -1) {
              complaintsList[idx] = complaintsList[idx].copy(status = "RESOLVED")
              Toast.makeText(context, "Ticket logged as completed.", Toast.LENGTH_SHORT).show()
            }
          }
        }
        3 -> CircularNoticesTabScreen(session, noticesList) { title, desc ->
          noticesList.add(
            0, NoticeItem(
              id = (noticesList.size + 1).toString(),
              title = title,
              content = desc,
              date = "08 Jun 2026",
              target = "ALL"
            )
          )
          Toast.makeText(context, "Circular notice broadcasted successfully status updated.", Toast.LENGTH_SHORT).show()
        }
        4 -> HousingBlueprintTabScreen(flatsList)
      }

      if (showAddComplaintDialog) {
        AddComplaintDialog(
          onDismiss = { showAddComplaintDialog = false },
          onSubmit = { cat, prio, subj, desc ->
            val size = complaintsList.size + 1
            complaintsList.add(
              0, ComplaintTicket(
                id = size.toString(),
                ticketNumber = "TKT-${300 + size}",
                category = cat,
                priority = prio,
                subject = subj,
                description = desc,
                status = "OPEN",
                raisedBy = "${session.firstName} ${session.lastName} (${session.roleName})",
                createdAt = "08 Jun 2026"
              )
            )
            showAddComplaintDialog = false
          }
        )
      }
    }
  }
}

@Composable
fun PortalMainTab(
  session: UserSessionState,
  bills: List<Bill>,
  complaints: List<ComplaintTicket>,
  notices: List<NoticeItem>
) {
  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // Welcome card containing detailed credential permissions status
    item {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(SlateCard)
          .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
          .padding(20.dp)
      ) {
        Text(
          text = "Secure Authorized Area",
          fontSize = 12.sp,
          color = EmeraldLight,
          fontWeight = FontWeight.Bold
        )
        Text(
          text = "Welcome, ${session.firstName} ${session.lastName}",
          fontSize = 20.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White,
          modifier = Modifier.padding(top = 2.dp)
        )
        Text(
          text = "Primary Role Group: ${session.roleName}",
          fontSize = 11.sp,
          color = TextMuted
        )

        Spacer(modifier = Modifier.height(14.dp))
        Divider(color = SlateBorder)
        Spacer(modifier = Modifier.height(14.dp))

        Text(
          text = "Registered Permissions Checklist:",
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          color = TextLight
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Display individual permissions active on this session
        session.permissions.forEach { perm ->
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(vertical = 2.dp)
          ) {
            Icon(Icons.Default.Check, contentDescription = "Active permission icon", tint = EmeraldCore, modifier = Modifier.size(14.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = perm, fontSize = 11.sp, color = TextMuted)
          }
        }
      }
    }

    // Displays aggregate contextual summaries according to session Roles
    item {
      Text(
        text = "SOCIETY OPERATIONS OVERVIEW",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = TextLight
      )
    }

    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        MetricCard(
          title = "Registered Base Area",
          value = "40 Flats",
          subLabel = "Buildings A & B",
          accentColor = EmeraldCore,
          modifier = Modifier.weight(1f)
        )
        MetricCard(
          title = "Unresolved tickets",
          value = "${complaints.count { it.status == "OPEN" }} Active",
          subLabel = "Assigned task items",
          accentColor = CrimsonAlert,
          modifier = Modifier.weight(1f)
        )
      }
    }

    notices.firstOrNull()?.let { notice ->
      item {
        NoticeCard(notice = notice)
      }
    }
  }
}

@Composable
fun BillingTabScreen(
  session: UserSessionState,
  bills: List<Bill>,
  onPayRequested: (Int) -> Unit
) {
  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    item {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(12.dp))
          .background(SlateCard)
          .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
          .padding(16.dp)
      ) {
        Text(
          text = "Finance & Invoice Calculator",
          fontWeight = FontWeight.Bold,
          fontSize = 15.sp,
          color = Color.White
        )
        Text(
          text = "Role scope permission status: ALLOWED",
          fontSize = 11.sp,
          color = EmeraldLight
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = "This view displays active housing dues ledger. Standard fixed billing distributes ₹1,700 monthly across A & B tower wings.",
          fontSize = 12.sp,
          color = TextMuted,
          lineHeight = 18.sp
        )
      }
    }

    items(bills.size) { index ->
      val bill = bills[index]
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(12.dp))
          .background(SlateCard)
          .border(1.dp, if (bill.status == "UNPAID") AccentOrange else SlateBorder, RoundedCornerShape(12.dp))
          .padding(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(text = bill.period, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
            Text(text = bill.invoiceNumber, fontSize = 11.sp, color = TextMuted)
          }
          StatusPill(status = bill.status)
        }

        Spacer(modifier = Modifier.height(10.dp))
        Divider(color = SlateBorder)
        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(text = "Dues Amount", fontSize = 11.sp, color = TextMuted)
            Text(
              text = "₹${bill.amount}",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = if (bill.status == "UNPAID") AccentOrange else EmeraldCore
            )
          }

          // Render operational pays ONLY if Owner/Super/Admin has permission
          if (bill.status == "UNPAID") {
            Button(
              onClick = { onPayRequested(index) },
              colors = ButtonDefaults.buttonColors(containerColor = EmeraldCore),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text("Pay Invoice", fontSize = 11.sp, color = OnPrimaryDark, fontWeight = FontWeight.Bold)
            }
          }
        }
      }
    }
  }
}

@Composable
fun ComplaintsTabScreen(
  session: UserSessionState,
  complaints: List<ComplaintTicket>,
  onResolveTriggered: (String) -> Unit
) {
  // Checks permissions to resolve tickets
  val canResolve = session.permissions.contains("complaint.resolve") || session.roleName == "SUPER_ADMIN" || session.roleName == "SOCIETY_ADMIN"

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text("Resident Complaints Desk", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
          Text("Active logged task items:", fontSize = 11.sp, color = TextMuted)
        }
        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(EmeraldCore.copy(alpha = 0.1f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
          Text("${complaints.size} Tickets", fontSize = 11.sp, color = EmeraldCore, fontWeight = FontWeight.Bold)
        }
      }
    }

    items(complaints) { ticket ->
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(12.dp))
          .background(SlateCard)
          .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
          .padding(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Text(ticket.ticketNumber, fontWeight = FontWeight.Bold, color = AccentBlue, fontSize = 13.sp)
            Text("·", color = TextMuted)
            Text(ticket.category, fontSize = 12.sp, color = TextLight, fontWeight = FontWeight.Medium)
          }
          StatusPill(status = ticket.status)
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(text = ticket.subject, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
        Text(text = ticket.description, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(top = 4.dp))

        Spacer(modifier = Modifier.height(12.dp))
        Divider(color = SlateBorder)
        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Logged by: ${ticket.raisedBy}", fontSize = 10.sp, color = TextMuted)
            Text("Date: ${ticket.createdAt}", fontSize = 10.sp, color = TextMuted)
          }

          if (ticket.status == "OPEN") {
            if (canResolve) {
              TextButton(
                onClick = { onResolveTriggered(ticket.id) },
                colors = ButtonDefaults.textButtonColors(contentColor = EmeraldCore)
              ) {
                Text("Resolve Complaint", fontSize = 11.sp, fontWeight = FontWeight.Bold)
              }
            } else {
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(4.dp))
                  .background(SlateBackground)
                  .padding(horizontal = 8.dp, vertical = 4.dp)
              ) {
                Text("Pending Vendor", fontSize = 10.sp, color = TextMuted)
              }
            }
          } else {
            Icon(Icons.Default.Check, contentDescription = "Resolved icon", tint = EmeraldCore, modifier = Modifier.size(20.dp))
          }
        }
      }
    }
  }
}

@Composable
fun CircularNoticesTabScreen(
  session: UserSessionState,
  notices: List<NoticeItem>,
  onPublishNotice: (String, String) -> Unit
) {
  // Checks permissions to publish bulletins: notice.create
  val canPublish = session.permissions.contains("notice.create") || session.roleName == "SUPER_ADMIN" || session.roleName == "SOCIETY_ADMIN"
  var isPublishBoxExpanded by remember { mutableStateOf(false) }

  var titleInput by remember { mutableStateOf("") }
  var contentInput by remember { mutableStateOf("") }

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text("Circular Broadcast Desk", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
          Text("General announcements list:", fontSize = 11.sp, color = TextMuted)
        }
        if (canPublish) {
          Button(
            onClick = { isPublishBoxExpanded = !isPublishBoxExpanded },
            colors = ButtonDefaults.buttonColors(containerColor = if (isPublishBoxExpanded) CrimsonAlert else EmeraldCore),
            shape = RoundedCornerShape(8.dp)
          ) {
            Text(if (isPublishBoxExpanded) "Cancel" else "Add Direct", fontSize = 10.sp, color = OnPrimaryDark, fontWeight = FontWeight.Bold)
          }
        }
      }
    }

    if (isPublishBoxExpanded && canPublish) {
      item {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(SlateCard)
            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
            .padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Text("Publish Circular Announcement", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
          OutlinedTextField(
            value = titleInput,
            onValueChange = { titleInput = it },
            label = { Text("Circular Heading Title", fontSize = 11.sp, color = TextMuted) },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = EmeraldCore,
              unfocusedBorderColor = SlateBorder
            ),
            modifier = Modifier.fillMaxWidth()
          )

          OutlinedTextField(
            value = contentInput,
            onValueChange = { contentInput = it },
            label = { Text("Details & Directives", fontSize = 11.sp, color = TextMuted) },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = EmeraldCore,
              unfocusedBorderColor = SlateBorder
            ),
            modifier = Modifier.fillMaxWidth()
          )

          Button(
            onClick = {
              if (titleInput.isNotBlank() && contentInput.isNotBlank()) {
                onPublishNotice(titleInput, contentInput)
                titleInput = ""
                contentInput = ""
                isPublishBoxExpanded = false
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldCore),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Broadcast to Residents", fontSize = 11.sp, color = OnPrimaryDark, fontWeight = FontWeight.Bold)
          }
        }
      }
    }

    items(notices) { notice ->
      NoticeCard(notice = notice)
    }
  }
}

@Composable
fun PermissionRestrictedFallback(requiredSpec: String) {
  Box(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    contentAlignment = Alignment.Center
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(16.dp))
        .background(SlateCard)
        .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
        .padding(24.dp)
    ) {
      Icon(Icons.Default.Lock, contentDescription = "Security restricted fallback lock icon", tint = CrimsonAlert, modifier = Modifier.size(48.dp))
      Spacer(modifier = Modifier.height(14.dp))
      Text("Permission Guard Active", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        text = "Your current account identity does not possess the [$requiredSpec] credential permission descriptor required to access this financial register.",
        color = TextMuted,
        fontSize = 12.sp,
        textAlign = TextAlign.Center,
        lineHeight = 18.sp
      )
    }
  }
}

@Composable
fun MetricCard(
  title: String,
  value: String,
  subLabel: String,
  accentColor: Color,
  modifier: Modifier = Modifier
) {
  Column(
    modifier = modifier
      .clip(RoundedCornerShape(12.dp))
      .background(SlateCard)
      .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
      .padding(16.dp)
  ) {
    Text(text = title, fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Bold)
    Spacer(modifier = Modifier.height(6.dp))
    Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = accentColor)
    Spacer(modifier = Modifier.height(2.dp))
    Text(text = subLabel, fontSize = 10.sp, color = TextMuted)
  }
}

@Composable
fun NoticeCard(notice: NoticeItem) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(12.dp))
      .background(SlateCard)
      .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
      .padding(16.dp)
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(notice.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
      Text(notice.date, fontSize = 10.sp, color = TextMuted)
    }
    Spacer(modifier = Modifier.height(8.dp))
    Text(
      text = notice.content,
      fontSize = 12.sp,
      color = TextLight,
      lineHeight = 18.sp
    )
  }
}

@Composable
fun StatusPill(status: String) {
  val backgroundColor = when (status) {
    "UNPAID" -> AccentOrange.copy(alpha = 0.15f)
    "PAID" -> EmeraldCore.copy(alpha = 0.15f)
    "OPEN" -> AccentBlue.copy(alpha = 0.15f)
    "RESOLVED" -> EmeraldCore.copy(alpha = 0.15f)
    else -> SlateBorder
  }
  
  val textColor = when (status) {
    "UNPAID" -> AccentOrange
    "PAID" -> EmeraldCore
    "OPEN" -> AccentBlue
    "RESOLVED" -> EmeraldCore
    else -> TextMuted
  }

  Box(
    modifier = Modifier
      .clip(RoundedCornerShape(4.dp))
      .background(backgroundColor)
      .padding(horizontal = 8.dp, vertical = 4.dp)
  ) {
    Text(text = status, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = textColor)
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddComplaintDialog(
  onDismiss: () -> Unit,
  onSubmit: (String, String, String, String) -> Unit
) {
  var category by remember { mutableStateOf("Plumbing") }
  var priority by remember { mutableStateOf("MEDIUM") }
  var subject by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }

  Dialog(onDismissRequest = onDismiss) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(16.dp))
        .background(SlateCard)
        .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
        .padding(20.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      Text("Raise Complaint Ticket", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)

      // Category Selection
      Text("Category Selection", fontSize = 11.sp, color = TextMuted)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        listOf("Plumbing", "Electrical", "Security").forEach { cat ->
          Text(
            text = cat,
            fontSize = 11.sp,
            modifier = Modifier
              .clickable { category = cat }
              .clip(RoundedCornerShape(6.dp))
              .background(if (category == cat) EmeraldCore else SlateBorder)
              .padding(horizontal = 12.dp, vertical = 6.dp),
            color = if (category == cat) OnPrimaryDark else TextLight,
            fontWeight = FontWeight.Bold
          )
        }
      }

      // Priority Level
      Text("Priority Level", fontSize = 11.sp, color = TextMuted)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        listOf("LOW", "MEDIUM", "HIGH", "URGENT").forEach { prio ->
          val color = when (prio) {
            "URGENT" -> CrimsonAlert
            "HIGH" -> AccentOrange
            "MEDIUM" -> AccentBlue
            else -> TextMuted
          }
          Text(
            text = prio,
            fontSize = 11.sp,
            modifier = Modifier
              .clickable { priority = prio }
              .clip(RoundedCornerShape(6.dp))
              .background(if (priority == prio) color else SlateBorder)
              .padding(horizontal = 10.dp, vertical = 6.dp),
            color = if (priority == prio) OnPrimaryDark else TextLight,
            fontWeight = FontWeight.Bold
          )
        }
      }

      OutlinedTextField(
        value = subject,
        onValueChange = { subject = it },
        label = { Text("Short Subject Heading", fontSize = 12.sp, color = TextMuted) },
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = EmeraldCore,
          unfocusedBorderColor = SlateBorder
        ),
        modifier = Modifier.fillMaxWidth()
      )

      OutlinedTextField(
        value = description,
        onValueChange = { description = it },
        label = { Text("Details describing issue...", fontSize = 12.sp, color = TextMuted) },
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = EmeraldCore,
          unfocusedBorderColor = SlateBorder
        ),
        modifier = Modifier.fillMaxWidth()
      )

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        TextButton(onClick = onDismiss) {
          Text("Cancel", color = CrimsonAlert)
        }
        Button(
          onClick = {
            if (subject.isNotBlank()) {
              onSubmit(category, priority, subject, description)
            }
          },
          colors = ButtonDefaults.buttonColors(containerColor = EmeraldCore),
          shape = RoundedCornerShape(8.dp)
        ) {
          Text("Submit Ticket", color = OnPrimaryDark, fontWeight = FontWeight.Bold)
        }
      }
    }
  }
}

@Composable
fun HousingBlueprintTabScreen(
  flats: List<FlatUnitItem>
) {
  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    item {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(SlateCard)
          .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
          .padding(20.dp)
      ) {
        Text(
          text = "Housing Registry Footprint",
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White
        )
        Text(
          text = "Cooperative database status: SYNCED",
          fontSize = 11.sp,
          color = EmeraldLight,
          fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(10.dp))
        Text(
          text = "Explore the physical housing directory registry mapping. Live updates show current tenant arrangements, carpets and building configs.",
          fontSize = 12.sp,
          color = TextMuted,
          lineHeight = 18.sp
        )

        Spacer(modifier = Modifier.height(16.dp))
        Divider(color = SlateBorder)
        Spacer(modifier = Modifier.height(16.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text("Towers / Wings", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
            Text("2 Towers / 4 Wings", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
          }
          Column(modifier = Modifier.weight(1f)) {
            Text("Registered Units", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
            Text("${flats.size} Flats", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = EmeraldCore)
          }
        }
      }
    }

    items(flats.size) { index ->
      val unit = flats[index]
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(12.dp))
          .background(SlateCard)
          .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
          .padding(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(EmeraldCore.copy(alpha = 0.15f))
                .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
              Text(
                text = "Flat ${unit.flatNumber}",
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = EmeraldCore
              )
            }

            Text(
              text = "${unit.building} · Wing ${unit.wing}",
              fontSize = 12.sp,
              color = TextLight,
              fontWeight = FontWeight.Bold
            )
          }

          val ownershipBg = when (unit.ownership) {
            "Owned" -> EmeraldCore.copy(alpha = 0.15f)
            "Rented" -> AccentBlue.copy(alpha = 0.15f)
            else -> TextMuted.copy(alpha = 0.15f)
          }
          val ownershipColor = when (unit.ownership) {
            "Owned" -> EmeraldCore
            "Rented" -> AccentBlue
            else -> TextMuted
          }
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(ownershipBg)
              .padding(horizontal = 8.dp, vertical = 2.dp)
          ) {
            Text(
              text = unit.ownership.uppercase(),
              fontSize = 9.sp,
              fontWeight = FontWeight.Bold,
              color = ownershipColor
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Divider(color = SlateBorder)
        Spacer(modifier = Modifier.height(12.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Occupancy Category", fontSize = 10.sp, color = TextMuted)
            Text(unit.occupancy, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium)
          }

          Column(horizontalAlignment = Alignment.End) {
            Text("Area Specs (${unit.type})", fontSize = 10.sp, color = TextMuted)
            Text(unit.area, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}
