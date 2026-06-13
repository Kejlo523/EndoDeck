// Full EndoDeck enclosure for Huawei P8 Lite ALE-L21.
// Print the front bezel face-down and the rear cover inner-face-down.

$fn = 64;

part = "assembly"; // front, rear, assembly
preview_phone = true;

phone_width = 143.0;
phone_height = 70.6;
phone_thickness = 7.7;
phone_corner = 5.0;

// 5-inch 16:9 active area plus a small touch-safe margin.
screen_width = 112.4;
screen_height = 63.6;
screen_offset_x = 0;
screen_offset_y = 0;

clearance = 0.55;
front_skin = 2.5;
shell_depth = 11.3;
outer_width = 157;
outer_height = 85;
outer_corner = 7;

cover_width = 155;
cover_height = 83;
cover_thickness = 3.2;
cover_corner = 6;

screw_x = 72.2;
screw_y = 36.4;
pilot_diameter = 2.55;
clearance_hole = 3.4;
head_recess = 6.4;

view_angle = 55;
stand_foot_y = -15;
stand_height = 28;

module rounded_rect_2d(width, height, radius) {
    offset(r = radius)
        square([width - radius * 2, height - radius * 2], center = true);
}

module rounded_prism(width, height, depth, radius) {
    linear_extrude(height = depth)
        rounded_rect_2d(width, height, radius);
}

module screw_positions() {
    for (x = [-screw_x, screw_x])
        for (y = [-screw_y, screw_y])
            translate([x, y, 0]) children();
}

module screen_aperture() {
    translate([screen_offset_x, screen_offset_y, -0.2])
        linear_extrude(height = front_skin + 0.5, scale = [1.015, 1.025])
            rounded_rect_2d(screen_width, screen_height, 2.2);
}

module usb_opening(extra_depth = 0) {
    // The phone is rotated clockwise, so micro-USB exits on the left.
    translate([-outer_width / 2 - 1, -8, front_skin + 0.8])
        cube([10 + extra_depth, 16, 8.2]);
}

module button_opening() {
    // Discreet access to power/volume on the upper long edge.
    translate([18, outer_height / 2 - 4, front_skin + 1.0])
        cube([48, 8, 7.2]);
}

module front_bezel() {
    difference() {
        union() {
            rounded_prism(outer_width, outer_height, shell_depth, outer_corner);

            // Corner posts live outside the rounded phone cavity.
            screw_positions()
                translate([0, 0, front_skin])
                    cylinder(h = shell_depth - front_skin, d = 6.2);
        }

        // Phone installs from the rear and rests directly behind the bezel.
        translate([0, 0, front_skin])
            linear_extrude(height = shell_depth + 1)
                rounded_rect_2d(
                    phone_width + clearance * 2,
                    phone_height + clearance * 2,
                    phone_corner + clearance
                );

        screen_aperture();
        usb_opening();
        button_opening();

        screw_positions()
            translate([0, 0, shell_depth - 6.8])
                cylinder(h = 8, d = pilot_diameter);
    }
}

module vent_slots() {
    for (x = [-42, -28, -14, 0, 14, 28, 42])
        translate([x, 3, -0.2])
            rounded_prism(7, 38, cover_thickness + 0.5, 2.5);
}

module kickstand_leg(x) {
    // Two independent legs avoid a long unsupported bridge during printing.
    hull() {
        translate([x - 5, -3, cover_thickness - 0.1])
            cube([10, 20, 5]);
        translate([x - 7, stand_foot_y - 8, stand_height])
            cube([14, 18, 5]);
    }

    // Flat pad with a recess for a 12 x 20 mm rubber foot.
    difference() {
        translate([x - 9, stand_foot_y - 10, stand_height - 1])
            cube([18, 22, 6]);
        translate([x - 6, stand_foot_y - 8, stand_height + 4.2])
            cube([12, 18, 1.1]);
    }
}

module rear_cover() {
    difference() {
        union() {
            rounded_prism(cover_width, cover_height, cover_thickness, cover_corner);
            kickstand_leg(-61);
            kickstand_leg(61);
        }

        vent_slots();

        // USB cable notch continues through the rear cover edge.
        translate([-cover_width / 2 - 1, -8.5, -0.2])
            cube([9, 17, cover_thickness + 0.5]);

        screw_positions() {
            translate([0, 0, -0.2]) cylinder(h = cover_thickness + 5, d = clearance_hole);
            translate([0, 0, 1.5]) cylinder(h = cover_thickness + 5, d = head_recess);
        }
    }

    // A shallow rear badge makes the finished part read as dedicated hardware.
    translate([0, 31, cover_thickness])
        linear_extrude(height = 0.7)
            text("ENDO DECK", size = 5, halign = "center", valign = "center", font = "Bahnschrift:style=Bold");
}

module phone_mockup() {
    color([0.025, 0.028, 0.025])
        translate([0, 0, front_skin])
            rounded_prism(phone_width, phone_height, phone_thickness, phone_corner);

    color([0.10, 0.16, 0.08])
        translate([screen_offset_x, screen_offset_y, front_skin - 0.08])
            linear_extrude(height = 0.12)
                rounded_rect_2d(screen_width - 0.8, screen_height - 0.8, 1.8);
}

module assembly() {
    color([0.10, 0.115, 0.10]) front_bezel();
    if (preview_phone) phone_mockup();
    color([0.07, 0.08, 0.07])
        translate([0, 0, shell_depth]) rear_cover();
}

if (part == "front") {
    front_bezel();
} else if (part == "rear") {
    rear_cover();
} else {
    // Presentation orientation: lower bezel and rear feet share the desk plane.
    translate([0, 0, 35])
        rotate([180 - view_angle, 0, 0])
            assembly();
}
