package com.househunt.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.househunt.entity.*;
import com.househunt.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final AmenityRepository amenityRepository;
    private final PropertyRepository propertyRepository;
    private final FavoriteRepository favoriteRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;
    private final MessageRepository messageRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    private Map<String, List<String>> pools = new HashMap<>();
    private Map<String, String> nhImages = new HashMap<>();
    private Map<String, Location> locMap = new HashMap<>();
    private Map<String, Amenity> amenityMap = new HashMap<>();
    private final Deque<String> coverDeck = new ArrayDeque<>();
    private final Map<String, ArrayDeque<String>> slotDecks = new HashMap<>();
    private String base;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }
        log.info("Seeding HouseHunt demo database…");
        ObjectMapper om = new ObjectMapper();
        Map<String, Object> assets = om.readValue(new ClassPathResource("img-assets.json").getInputStream(),
                new TypeReference<>() {});
        Map<String, Object> poolsRaw = (Map<String, Object>) assets.get("pools");
        poolsRaw.forEach((k, v) -> pools.put(k, (List<String>) v));
        nhImages = (Map<String, String>) assets.get("neighborhoods");
        base = (String) assets.get("base");
        initImageDecks(assets);

        seedLocations();
        seedAmenities();
        List<User> owners = seedOwners();
        List<User> tenants = seedTenants();
        User admin = userRepository.findByEmail("admin@househunt.in").orElseThrow();
        List<Property> props = seedProperties(owners);
        seedEngagement(props, owners, tenants, admin);
        log.info("Seeded: users={} locations={} amenities={} properties={} favorites={} apps={} visits={} msgs={} reviews={}",
                userRepository.count(), locationRepository.count(), amenityRepository.count(), propertyRepository.count(),
                favoriteRepository.count(), applicationRepository.count(), visitRepository.count(),
                messageRepository.count(), reviewRepository.count());
    }

    // ------------------------------------------------------------- seed data

    private void seedLocations() {
        List<Object[]> defs = List.of(
                new Object[]{"Indiranagar", "indiranagar", "East Bengaluru", "The design capital of the city — tree-lined streets, cafés on every corner and a pace that still feels human. Homes range from iconic bungalows to sleek towers within walking distance of 100 Feet Road's best restaurants.", 12.9719, 77.6412, 30000, 95000},
                new Object[]{"Koramangala", "koramangala", "South Bengaluru", "Startups, tech parks and Karnataka's best food scene live side by side with quiet, leafy residential blocks. A favourite for young professionals who want the city's energy but a calm apartment to return to.", 12.9352, 77.6245, 26000, 85000},
                new Object[]{"HSR Layout", "hsr-layout", "South Bengaluru", "Sector roads lined with low-rise apartments and indie cafés. HSR has become Bengaluru's most walkable neighbourhood — equal parts community and connectivity to the outer ring road.", 12.9116, 77.6397, 20000, 72000},
                new Object[]{"Whitefield", "whitefield", "IT Corridor East", "Home to ITPL and international schools, Whitefield rewards those who prefer space and newer construction over a short commute. Gated communities dominate this fast-growing eastern edge.", 12.9698, 77.7499, 16000, 55000},
                new Object[]{"Bellandur", "bellandur", "Outer Ring Road", "The gateway between the city and the tech corridor. Bellandur's high-rises put you minutes from the ORR's offices while Sarjapur Road and HSR open up behind you.", 12.9260, 77.6773, 20000, 85000},
                new Object[]{"Electronic City", "electronic-city", "South IT Corridor", "Where Infosys, Wipro and a dozen campuses anchor Bengaluru's southern edge. Purpose-built service apartments and tidy communities make it a pragmatic choice for the phase-1 crowd.", 12.8452, 77.6602, 12000, 35000},
                new Object[]{"Jayanagar", "jayanagar", "Old Bengaluru", "Four decades of quiet charm. Wide roads, old gulmohar trees and South India's finest breakfast spots — Jayanagar is Bengaluru at its most settled.", 12.9250, 77.5938, 18000, 65000},
                new Object[]{"JP Nagar", "jp-nagar", "South Bengaluru", "A long-time residential favourite stretching from the metro spine to the suburbs beyond Kanakapura Road. Families get space and greenery without leaving the city proper.", 12.9056, 77.5855, 14000, 48000},
                new Object[]{"Yelahanka", "yelahanka", "North Bengaluru", "A fast-appreciating northern hub around the new aerospace and defence districts. Broad roads, fresh construction and genuinely affordable rent.", 13.1007, 77.5963, 10000, 28000},
                new Object[]{"Hebbal", "hebbal", "North Bengaluru", "Manyata Tech Park, the airport expressway and the lake district converge here. Hebbal has quietly become north Bengaluru's most premium address for renters.", 13.0358, 77.5970, 16000, 98000}
        );
        int i = 0;
        for (Object[] d : defs) {
            Location l = new Location();
            l.setName((String) d[0]);
            l.setSlug((String) d[1]);
            l.setRegion((String) d[2]);
            l.setDescription((String) d[3]);
            l.setLat((double) d[4]);
            l.setLng((double) d[5]);
            l.setAvgRentMin((int) d[6]);
            l.setAvgRentMax((int) d[7]);
            l.setImageUrl(img(nhImages.get(l.getSlug()), 1400));
            l.setSortOrder(i++);
            locMap.put(l.getSlug(), locationRepository.save(l));
        }
    }

    private void seedAmenities() {
        List<String[]> defs = List.of(
                new String[]{"Car Parking", "parking", "essential", "Car"},
                new String[]{"Lift", "lift", "essential", "MoveUp"},
                new String[]{"Power Backup", "power-backup", "essential", "Zap"},
                new String[]{"Water Storage", "water-storage", "essential", "Droplets"},
                new String[]{"Modular Kitchen", "modular-kitchen", "lifestyle", "ChefHat"},
                new String[]{"Air Conditioning", "air-conditioning", "lifestyle", "Snowflake"},
                new String[]{"Geyser", "geyser", "lifestyle", "Flame"},
                new String[]{"Fully Furnished", "furnished", "lifestyle", "Sofa"},
                new String[]{"Private Balcony", "balcony", "lifestyle", "Sun"},
                new String[]{"High-speed WiFi Ready", "wifi", "lifestyle", "Wifi"},
                new String[]{"Housekeeping", "housekeeping", "lifestyle", "Sparkles"},
                new String[]{"Gym", "gym", "lifestyle", "Dumbbell"},
                new String[]{"Swimming Pool", "swimming-pool", "outdoor", "Waves"},
                new String[]{"Clubhouse", "clubhouse", "outdoor", "Users"},
                new String[]{"Children's Play Area", "play-area", "outdoor", "Baby"},
                new String[]{"Gated Community", "gated-community", "security", "Shield"},
                new String[]{"CCTV Surveillance", "cctv", "security", "Video"},
                new String[]{"Security Guard", "security-guard", "security", "UserCheck"},
                new String[]{"Intercom", "intercom", "security", "Phone"},
                new String[]{"Pet Friendly", "pet-friendly", "lifestyle", "PawPrint"}
        );
        int i = 0;
        for (String[] d : defs) {
            Amenity a = new Amenity();
            a.setName(d[0]); a.setSlug(d[1]); a.setCategory(d[2]); a.setIcon(d[3]);
            a.setSortOrder(i++);
            amenityMap.put(d[1], amenityRepository.save(a));
        }
    }

    private User mkUser(String name, String email, String phone, String pwd, Role role, User.AccountType type) {
        User u = new User();
        u.setFullName(name); u.setEmail(email); u.setPhone(phone); u.setPasswordHash(pwd);
        u.setRole(role); u.setAccountType(type); u.setVerified(true);
        u.setAvatarUrl("https://api.dicebear.com/9.x/initials/svg?seed=" + name.replaceAll(" ", "")
                + "&backgroundColor=d9d2c4");
        return userRepository.save(u);
    }

    private List<User> seedOwners() {
        String pwd = passwordEncoder.encode("HouseHunt@123");
        mkUser("Aryan Kulkarni", "admin@househunt.in", "+91 98450 00001", pwd, Role.ADMIN, User.AccountType.OWNER);
        return List.of(
                mkUser("Aditi Verma", "aditi@househunt.in", "+91 98450 11111", pwd, Role.OWNER, User.AccountType.OWNER),
                mkUser("Rohan Bhat", "rohan@househunt.in", "+91 98450 22222", pwd, Role.OWNER, User.AccountType.OWNER),
                mkUser("Meera Krishnan", "meera@househunt.in", "+91 98450 33333", pwd, Role.OWNER, User.AccountType.OWNER));
    }

    private List<User> seedTenants() {
        String pwd = passwordEncoder.encode("HouseHunt@123");
        return List.of(
                mkUser("Ananya Rao", "tenant@househunt.in", "+91 98450 44444", pwd, Role.TENANT, User.AccountType.TENANT),
                mkUser("Kabir Shah", "kabir@househunt.in", "+91 98450 55555", pwd, Role.TENANT, User.AccountType.TENANT),
                mkUser("Nisha Patil", "nisha@househunt.in", "+91 98450 66666", pwd, Role.TENANT, User.AccountType.TENANT),
                mkUser("Sanjay Iyer", "sanjay@househunt.in", "+91 98450 77777", pwd, Role.TENANT, User.AccountType.TENANT));
    }

    // ------------------------------------------------------------------ properties

    private List<Property> seedProperties(List<User> owners) {
        User aditi = owners.get(0), rohan = owners.get(1), meera = owners.get(2);
        List<Property> out = new ArrayList<>();

        out.add(prop("A sunlit 2BHK on Indiranagar's 12th Main", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "indiranagar", aditi, 2, 2, 1250, 55000, "Two calm bedrooms open off a long balcony that catches the east light. The living room is generous enough for a proper dining set, and the building is a quiet four-storey walk-up — rare to find this close to 12th Main's cafés. Coffee, laundry and groceries are all within a five-minute walk.", true, 3));
        out.add(prop("Compact 1BHK near 100 Feet Road", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "indiranagar", aditi, 1, 1, 680, 34000, "A smartly planned one-bedroom for someone who spends the day out and the evening well. The bedroom fits a queen bed with room to spare and the kitchen is new with modular storage. Metro, parks and the weekend market are all walkable.", false, 4));
        out.add(prop("3BHK corner residence above the tree line", Property.PropertyType.PENTHOUSE, Property.Furnishing.SEMI_FURNISHED,
                "indiranagar", aditi, 3, 3, 2150, 98000, "A full-floor corner apartment with open views over Indiranagar's canopy. Three large bedrooms, each with its own balcony and bath, wrap around a wide family living area. Two-car parking, whole-home power backup and a lift that opens on your floor.", true, 9));
        out.add(prop("Garden-facing 2BHK in Koramangala 5th Block", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "koramangala", aditi, 2, 2, 1420, 62000, "Faces a shared courtyard garden instead of the next building — the balcony is genuinely usable. Both bedrooms are queen-sized with built-in wardrobes and the second bath has a window. Five minutes to Jyoti Nivas and the endless food of 5th Block main road.", true, 6));
        out.add(prop("Tidy 1BHK on Koramangala's 80 Feet Road", Property.PropertyType.APARTMENT, Property.Furnishing.SEMI_FURNISHED,
                "koramangala", aditi, 1, 1, 720, 36000, "A functional one-bedroom for the startup crowd — steps from 80 Feet Road's offices, gyms and late-night dosa points. Tiled floors throughout, a western kitchen and enough storage for city life.", false, 5));
        out.add(prop("Bright 3BHK across from Forum Mall", Property.PropertyType.APARTMENT, Property.Furnishing.SEMI_FURNISHED,
                "koramangala", aditi, 3, 3, 1900, 85000, "High floor in a well-maintained society beside Forum with clear views towards the stadium. Three good bedrooms and a large hall that handles weekend hosting without effort. Residents love the gym and walking to the mall.", false, 7));
        out.add(prop("2BHK off 27th Main, HSR Sector 2", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "hsr-layout", rohan, 2, 2, 1380, 48000, "A quietly located flat minutes from the 27th Main cafés but on a lane that stays peaceful. Living room sized for a real sofa, two baths and a balcony that gets afternoon shade. Bicycle storage and visitor parking included.", true, 6));
        out.add(prop("Compact studio for working professionals", Property.PropertyType.STUDIO, Property.Furnishing.FURNISHED,
                "hsr-layout", rohan, 1, 1, 560, 29000, "A properly designed studio — not a cut-up bedroom. Separate kitchenette nook, a work corner with a view of the street, and a balcony rail you can rest your laptop on. WiFi, washing machine and housekeeping included.", false, 2));
        out.add(prop("2BHK near ITPL in a quiet Whitefield lane", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "whitefield", aditi, 2, 2, 1200, 35000, "A fuss-free two-bedroom within walking distance of ITPL and a bus route to the metro. Newly repainted with a modular kitchen and two baths you won't queue for on a work morning.", false, 8));
        out.add(prop("Independent 2BHK villa with its own garden", Property.PropertyType.INDEPENDENT_HOUSE, Property.Furnishing.SEMI_FURNISHED,
                "whitefield", meera, 2, 2, 1650, 43000, "A rare independent house in Whitefield with a real garden and a car porch. High ceilings, terracotta floors and a sit-out that catches the winter sun. No society politics — and the landlord is famously hands-off.", false, 10));
        out.add(prop("Lake-view 3BHK in a Bellandur high-rise", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "bellandur", rohan, 3, 3, 1850, 79000, "Above the 18th floor the city disappears — you get the lake, the sunrise and quiet. Three big bedrooms, a living room that flows to the balcony, and clubhouse access with pool and gym.", true, 15));
        out.add(prop("Efficient 1BHK on Outer Ring Road", Property.PropertyType.APARTMENT, Property.Furnishing.SEMI_FURNISHED,
                "bellandur", rohan, 1, 1, 640, 30000, "For people whose real office is on the ORR. A well-kept one-bedroom in a compact society with covered parking, 24×7 water and a gym that's never crowded. Move-in ready within the week.", false, 4));
        out.add(prop("2BHK opposite the Infosys campus gate", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "electronic-city", meera, 2, 2, 1150, 27000, "Shave your commute to a two-minute walk. This two-bedroom sits opposite a major campus gate in a small secure gated layout with round-the-clock security. Ideal for a working couple.", false, 12));
        out.add(prop("Service apartment 1BHK, Electronic City Phase 1", Property.PropertyType.SERVICE_APARTMENT, Property.Furnishing.FURNISHED,
                "electronic-city", meera, 1, 1, 540, 23000, "Purpose-built for IT stays — housekeeping twice a week, a proper desk and all utilities bundled. Short or long leases welcome. Most residents walk to work and fly home on weekends.", false, 3));
        out.add(prop("Classic 2BHK in Jayanagar 4th Block", Property.PropertyType.APARTMENT, Property.Furnishing.SEMI_FURNISHED,
                "jayanagar", aditi, 2, 2, 1350, 44000, "Old Bangalore charm with new plumbing. A well-proportioned two-bedroom on a quiet 4th Block road, ten minutes on foot to the metro and the park. The street knows your name here.", false, 11));
        out.add(prop("Newly finished 3BHK in Jayanagar East", Property.PropertyType.APARTMENT, Property.Furnishing.UNFURNISHED,
                "jayanagar", aditi, 3, 3, 2050, 69000, "Freshly completed and never lived in — bring your own furniture and make it yours. Wide balconies on three sides, an open kitchen plan and a second living nook off the master bedroom.", true, 13));
        out.add(prop("Ground-floor 2BHK with a private garden", Property.PropertyType.INDEPENDENT_HOUSE, Property.Furnishing.SEMI_FURNISHED,
                "jayanagar", aditi, 2, 2, 1500, 54000, "One of those Jayanagar homes people drive slowly past. A ground-floor flat in a two-storey family house with its own garden patch, a sit-out under a rain tree and parking for two. Perfect for a dog owner.", false, 8));
        out.add(prop("2BHK walking distance from JP Nagar metro", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "jp-nagar", rohan, 2, 2, 1300, 35000, "A light-filled corner flat in a six-floor society with a view over the neighbouring avenue. Five minutes to the metro, ten to the 24th Main market. A young, friendly community.", false, 7));
        out.add(prop("Value 1BHK in JP Nagar 8th Phase", Property.PropertyType.APARTMENT, Property.Furnishing.UNFURNISHED,
                "jp-nagar", rohan, 1, 1, 560, 20000, "Clean, honest and priced for a starter budget. A straightforward one-bedroom in a simple three-floor walk-up, freshly painted with a new geyser and fans.", false, 2));
        out.add(prop("2BHK in a gated community in Yelahanka New Town", Property.PropertyType.APARTMENT, Property.Furnishing.SEMI_FURNISHED,
                "yelahanka", meera, 2, 2, 1180, 25000, "Big-society living at an honest north-Bangalore price. Pool, gym, tennis court and parking for every family's second car. The flat itself is a clean two-bedroom over the central greens.", false, 9));
        out.add(prop("Spacious 3BHK villa with a double-height living room", Property.PropertyType.VILLA, Property.Furnishing.SEMI_FURNISHED,
                "yelahanka", meera, 3, 3, 2600, 50000, "A proper villa in a plotted layout — double-height living, a dining hall that seats ten, three bedrooms with walk-in closets and a terrace for Bangalore evenings.", true, 14));
        out.add(prop("2BHK minutes from Manyata Tech Park", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "hebbal", rohan, 2, 2, 1250, 39000, "The Manyata crowd's favourite kind of flat — close enough that the commute is a blink, far enough that evenings are quiet. Two bedrooms, covered parking and a balcony facing the flyover lights.", false, 10));
        out.add(prop("Penthouse 3BHK with a private deck, Hebbal", Property.PropertyType.PENTHOUSE, Property.Furnishing.FURNISHED,
                "hebbal", rohan, 3, 3, 2300, 99000, "The top two floors of a boutique Hebbal tower: a private deck with a plunge pool, an open-plan living level and three en-suite bedrooms below. Rare volume in north Bengaluru.", true, 18));

        // queue listings (pending / suspended) so the admin verification flow has live data
        Property studio = prop("Studio near Nitte Meenakshi College", Property.PropertyType.STUDIO, Property.Furnishing.SEMI_FURNISHED,
                "yelahanka", meera, 1, 1, 480, 14000, "A compact studio in a new four-storey walk-up aimed at students and young professionals. Good light, a reliable borewell and quick access to Bellary Road.", false, 1);
        studio.setStatus(Property.Status.PENDING);
        Property twin = prop("2BHK in Shanthiniketan Township", Property.PropertyType.APARTMENT, Property.Furnishing.UNFURNISHED,
                "electronic-city", meera, 2, 1, 1050, 22000, "A straightforward two-bedroom in an established Electronic City township with schools and shops on campus. Unfurnished and ready for a long-term tenant.", false, 1);
        twin.setStatus(Property.Status.PENDING);
        Property jakkur = prop("3BHK in Jakkur with a lake-adjacent balcony", Property.PropertyType.APARTMENT, Property.Furnishing.FURNISHED,
                "yelahanka", meera, 3, 2, 1750, 36000, "A comfortable three-bedroom in a Jakkur society minutes from the lake walk and the Aerospace Park. Currently paused for minor balcony repairs.", false, 3);
        jakkur.setStatus(Property.Status.SUSPENDED);

        out.add(studio); out.add(twin); out.add(jakkur);
        propertyRepository.saveAll(out);
        propertyRepository.flush();
        return out;
    }

    private Property prop(String title, Property.PropertyType type, Property.Furnishing furn,
                          String slug, User owner, int beds, int baths, int sqft, int rent,
                          String desc, boolean featured, int seed) {
        Property p = new Property();
        p.setTitle(title);
        p.setType(type);
        p.setFurnishing(furn);
        p.setOwner(owner);
        p.setLocation(locMap.get(slug));
        p.setAddress(locMap.get(slug).getName());
        double jitter = (seed % 5) * 0.0007;
        p.setLat(p.getLocation().getLat() + (seed % 2 == 0 ? jitter : -jitter));
        p.setLng(p.getLocation().getLng() + ((seed % 3) * 0.0005));
        p.setDescription(desc);
        p.setRentPerMonth(rent);
        p.setDeposit(rent * 2);
        p.setMaintenancePerMonth(Math.max(1500, (rent * 9) / 100 / 500 * 500));
        p.setFloorAreaSqft(sqft);
        p.setBedrooms(beds);
        p.setBathrooms(baths);
        p.setBalconies(beds >= 2 ? 1 : 0);
        p.setAvailableFrom(LocalDate.now().plusDays(4 + seed % 20));
        p.setPetAllowed(seed % 3 == 0);
        p.setLeaseTerm("11 months");
        p.setHouseRules("No smoking indoors · Quiet hours after 10 pm · Pets welcome with prior approval");
        p.setAvailable(true);
        p.setFeatured(featured);
        p.setVerified(true);
        p.setStatus(Property.Status.APPROVED);
        p.setViewCount(240L + seed * 93L);
        p.setPublishedAt(Instant.now().minusSeconds((long) seed * 86400 * 9 + 3600 * 7));
        gallery(p, seed, type);
        attachAmenities(p, beds, seed, type);
        return p;
    }

    /**
     * Covers are dealt from one shuffled exterior+living deck so every listing gets its
     * own front image (and none repeats the site hero or About/neighbourhood photos).
     * Interior slots are drawn from per-category decks, deduped against the listing's
     * own cover, so galleries read as a real photo set rather than recycled stock.
     */
    private void initImageDecks(Map<String, Object> assets) {
        String hero = (String) assets.get("hero");
        String about = (String) assets.get("about");
        List<String> coverPool = new ArrayList<>();
        coverPool.addAll(pools.getOrDefault("exterior", List.of()));
        coverPool.addAll(pools.getOrDefault("living", List.of()));
        coverPool.removeIf(id -> id.equals(hero) || id.equals(about) || nhImages.containsValue(id));
        coverPool = coverPool.stream().distinct().collect(java.util.stream.Collectors.toList());
        Collections.shuffle(coverPool);
        coverDeck.addAll(coverPool);
        pools.forEach((cat, ids) -> {
            List<String> shuffled = new ArrayList<>(ids);
            Collections.shuffle(shuffled);
            slotDecks.put(cat, new ArrayDeque<>(shuffled));
        });
    }

    private void gallery(Property p, int seed, Property.PropertyType type) {
        List<String> urls = new ArrayList<>();
        if (!coverDeck.isEmpty()) urls.add(coverDeck.pollFirst());
        String[] order = switch (type) {
            case VILLA, INDEPENDENT_HOUSE -> new String[]{"exterior", "living", "bedroom", "kitchen", "bath", "balcony"};
            case PENTHOUSE -> new String[]{"living", "exterior", "bedroom", "kitchen", "bath", "balcony"};
            default -> new String[]{"living", "bedroom", "kitchen", "bath", "balcony", "exterior"};
        };
        // preferred interior order
        for (String cat : order) {
            if (urls.size() >= 6) break;
            drawUnique(cat, urls);
        }
        // top-up passes — first along the listing's own preferred order, then across
        // every category deck, so galleries always fill while staying unique within the listing
        int guard = 0;
        while (urls.size() < 6 && guard++ < 3) {
            boolean moved = false;
            for (String cat : order) {
                if (urls.size() >= 6) break;
                int before = urls.size();
                drawUnique(cat, urls);
                moved = moved || urls.size() != before;
            }
            if (urls.size() < 6) {
                for (String cat : slotDecks.keySet()) {
                    if (urls.size() >= 6) break;
                    int before = urls.size();
                    drawUnique(cat, urls);
                    moved = moved || urls.size() != before;
                }
            }
            if (!moved) break;
        }
        for (int i = 0; i < urls.size(); i++) {
            PropertyImage im = new PropertyImage();
            im.setUrl(img(urls.get(i), 1800));
            im.setAltText(p.getTitle());
            im.setSortOrder(i);
            im.setCover(i == 0);
            p.addImage(im);
        }
    }

    private void drawUnique(String cat, List<String> urls) {
        ArrayDeque<String> q = slotDecks.get(cat);
        if (q == null || q.isEmpty()) return;
        // Rotating deck: a candidate already used in this listing is sent to the tail,
        // and a selected candidate is returned to the tail as well, so category decks
        // never run dry across the catalogue — only within-listing uniqueness matters.
        int attempts = q.size();
        for (int i = 0; i < attempts; i++) {
            String id = q.pollFirst();
            if (id == null) break;
            if (!urls.contains(id)) { urls.add(id); }
            q.addLast(id);
            return;
        }
    }

    private void attachAmenities(Property p, int beds, int seed, Property.PropertyType type) {
        List<String> pool = new ArrayList<>(List.of(
                "parking", "lift", "power-backup", "water-storage", "modular-kitchen", "balcony", "wifi",
                "cctv", "gated-community", "security-guard", "intercom"));
        if (seed % 2 == 0) pool.add("air-conditioning");
        if (beds >= 2) pool.add("geyser");
        if (type == Property.PropertyType.VILLA || type == Property.PropertyType.INDEPENDENT_HOUSE
                || type == Property.PropertyType.PENTHOUSE) pool.add("pet-friendly");
        if (seed % 3 == 0) pool.add("furnished");
        if (seed % 4 == 0) pool.add("gym");
        Collections.shuffle(pool, new Random(seed * 37L + 7));
        Set<Amenity> chosen = new LinkedHashSet<>();
        int count = Math.min(6 + beds * 2, pool.size());
        for (int i = 0; i < count; i++) {
            Amenity a = amenityMap.get(pool.get(i));
            if (a != null) chosen.add(a);
        }
        p.setAmenities(chosen);
    }

    // -------------------------------------------------------------- engagement

    private void seedEngagement(List<Property> p, List<User> owners, List<User> tenants, User admin) {
        User ananya = tenants.get(0), kabir = tenants.get(1), nisha = tenants.get(2), sanjay = tenants.get(3);
        User meera = owners.get(2);

        // favourites
        fav(ananya, p.get(0)); fav(ananya, p.get(3)); fav(ananya, p.get(10));
        fav(kabir, p.get(6)); fav(kabir, p.get(22));
        fav(nisha, p.get(4)); fav(sanjay, p.get(14));

        // applications (tenant → different owners, varied statuses)
        app(ananya, p.get(0), "I'm a product designer relocating from Mumbai with a 6-month-old beagle. Verified documents available — happy to share my current landlord's reference.", LocalDate.now().plusDays(10), Application.Status.PENDING);
        app(ananya, p.get(3), "Looking for a 14-month lease starting next month. I work from home two days a week and keep a very quiet home.", LocalDate.now().plusDays(18), Application.Status.SHORTLISTED);
        app(nisha, p.get(4), "Recent transfer to the 80 Feet Road office. I'd love a viewing this weekend and can move in within 10 days.", LocalDate.now().plusDays(12), Application.Status.PENDING);
        app(kabir, p.get(10), "Working at a firm near Bellandur. Interested in a long lease — 24 months if the owner prefers stability.", LocalDate.now().plusDays(20), Application.Status.SHORTLISTED);
        app(sanjay, p.get(8), "Relocating with family of two. Looking for a 2-year lease, bank guarantee available.", LocalDate.now().plusDays(25), Application.Status.PENDING);
        app(nisha, p.get(21), "Prefer a 6-month lease as my project may move to the airport corridor next year.", LocalDate.now().plusDays(8), Application.Status.APPROVED);

        // visits
        visit(ananya, p.get(0), LocalDateTime.now().plusDays(2).withHour(11).withMinute(0), Visit.Mode.IN_PERSON, Visit.Status.CONFIRMED, "Requested slot after office hours is fine.");
        visit(ananya, p.get(6), LocalDateTime.now().plusDays(4).withHour(17).withMinute(30), Visit.Mode.IN_PERSON, Visit.Status.REQUESTED, null);
        visit(kabir, p.get(21), LocalDateTime.now().plusDays(3).withHour(18).withMinute(0), Visit.Mode.IN_PERSON, Visit.Status.REQUESTED, "Weekend also works.");
        visit(kabir, p.get(22), LocalDateTime.now().plusDays(5).withHour(11).withMinute(30), Visit.Mode.VIDEO_CALL, Visit.Status.CONFIRMED, "I'm in Chennai until the 12th — video walkthrough first.");
        visit(nisha, p.get(4), LocalDateTime.now().plusDays(1).withHour(10).withMinute(30), Visit.Mode.IN_PERSON, Visit.Status.CONFIRMED, null);
        visit(nisha, p.get(17), LocalDateTime.now().minusDays(3).withHour(16).withMinute(0), Visit.Mode.IN_PERSON, Visit.Status.COMPLETED, "Loved the flat, evaluating the society.");
        visit(sanjay, p.get(8), LocalDateTime.now().plusDays(5).withHour(12).withMinute(0), Visit.Mode.IN_PERSON, Visit.Status.REQUESTED, null);

        // messages (a few threads with unread counts)
        msg(p.get(0).getOwner(), ananya, p.get(0), "Hi Ananya — thanks for applying. I can show the flat this Saturday morning if that suits you.", false);
        msg(ananya, p.get(0).getOwner(), p.get(0), "That would be great. Is 11 am alright? And is the rent negotiable given the 24-month lease?", true);
        msg(p.get(0).getOwner(), ananya, p.get(0), "11 am works. On the rent — let's talk after you see the place. I'm usually flexible for the right tenant.", false);
        msg(kabir, p.get(10).getOwner(), p.get(10), "Hi, is the Bellandur 3BHK still available for mid-month move-in?", false);
        msg(p.get(3).getOwner(), ananya, p.get(3), "Ananya, we've shortlisted your application for the 5th Block flat. Would you like to schedule the formal visit?", false);
        msg(nisha, p.get(21).getOwner(), p.get(21), "Requesting a quick call to discuss the deposit terms on the Manyata 2BHK.", true);

        // reviews
        review(sanjay, p.get(0), 5, "Exactly as photographed. Transparent owner, smooth agreement, and the flat is genuinely quiet. Would rent again.", true);
        review(kabir, p.get(6), 5, "The HSR 2BHK is the best value I saw in three weeks of searching. Building is well kept and the society is young.", true);
        review(ananya, p.get(10), 4, "Gorgeous lake view and a serious clubhouse. Maintenance is a touch high but the amenities justify it.", true);
        review(kabir, p.get(15), 4, "Newly finished and spotless when I visited. Pending approval on the listing photos.", false);
        review(ananya, p.get(20), 5, "The double-height living room photographs badly — it's better in person. Lovely villa.", false);

        // notifications
        notifyUser(p.get(0).getOwner(), Notification.Type.APPLICATION, "New rental application", "Ananya Rao applied for \"A sunlit 2BHK on Indiranagar's 12th Main\".", "/owner/applications");
        notifyUser(p.get(3).getOwner(), Notification.Type.APPLICATION, "Application shortlisted", "You shortlisted Ananya Rao's application for the Koramangala 5th Block flat.", "/owner/applications");
        notifyUser(p.get(10).getOwner(), Notification.Type.VISIT, "New viewing request", "Kabir Shah requested a viewing of \"Lake-view 3BHK in a Bellandur high-rise\".", "/owner/visits");
        notifyUser(p.get(21).getOwner(), Notification.Type.VISIT, "New viewing request", "Nisha Patil requested a viewing of \"2BHK minutes from Manyata Tech Park\".", "/owner/visits");
        notifyUser(ananya, Notification.Type.VISIT, "Visit confirmed", "Your visit to the 12th Main 2BHK on " + LocalDate.now().plusDays(2) + " at 11:00 was confirmed by the owner.", "/tenant/visits");
        notifyUser(ananya, Notification.Type.APPLICATION, "Application shortlisted", "Good news — your application for the Koramangala 5th Block flat was shortlisted.", "/tenant/applications");
        notifyUser(meera, Notification.Type.LISTING, "Listing submitted", "Your studio listing was submitted and is awaiting verification.", "/owner/properties");
        notifyUser(admin, Notification.Type.SYSTEM, "3 listings waiting", "There are 3 listings in the verification queue.", "/admin/properties");
    }

    private void fav(User u, Property p) {
        Favorite f = new Favorite(); f.setUser(u); f.setProperty(p);
        favoriteRepository.save(f);
    }

    private void app(User u, Property p, String msg, LocalDate move, Application.Status st) {
        Application a = new Application();
        a.setUser(u); a.setProperty(p); a.setMessage(msg); a.setMoveInDate(move); a.setStatus(st);
        a.setCreatedAt(Instant.now().minusSeconds(new Random().nextInt(5 * 86400)));
        applicationRepository.save(a);
    }

    private void visit(User u, Property p, LocalDateTime at, Visit.Mode mode, Visit.Status st, String note) {
        Visit v = new Visit();
        v.setUser(u); v.setProperty(p); v.setScheduledAt(at); v.setMode(mode); v.setStatus(st); v.setNote(note);
        v.setCreatedAt(Instant.now().minusSeconds(new Random().nextInt(4 * 86400)));
        visitRepository.save(v);
    }

    private void msg(User from, User to, Property p, String body, boolean read) {
        Message m = new Message();
        m.setSender(from); m.setRecipient(to); m.setProperty(p); m.setBody(body); m.setRead(read);
        m.setCreatedAt(Instant.now().minusSeconds(new Random().nextInt(6 * 86400)));
        messageRepository.save(m);
    }

    private void review(User u, Property p, int stars, String comment, boolean approved) {
        Review rv = new Review();
        rv.setAuthor(u); rv.setProperty(p); rv.setRating(stars); rv.setComment(comment); rv.setApproved(approved);
        rv.setCreatedAt(Instant.now().minusSeconds(new Random().nextInt(30 * 86400)));
        reviewRepository.save(rv);
    }

    private void notifyUser(User to, Notification.Type type, String title, String body, String link) {
        Notification n = new Notification();
        n.setUser(to); n.setType(type); n.setTitle(title); n.setBody(body); n.setLink(link);
        n.setCreatedAt(Instant.now().minusSeconds(new Random().nextInt(3 * 86400)));
        notificationRepository.save(n);
    }

    private String img(String id, int w) {
        return base.replace("{id}", id).replace("{w}", String.valueOf(w));
    }
}
